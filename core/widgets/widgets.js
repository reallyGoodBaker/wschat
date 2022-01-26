'use strict';
import {CustomError, EClass,Interface, throwError} from '../utils/core.js';

const render = (renderObj) => {
    let data = {
        width: renderObj.width || 'fit-content',
        height: renderObj.height || 'fit-content',
        border: renderObj.border || {width:'0px',color:'transparent',type:'solid'},//**复合对象**  宽度，颜色 
        color: renderObj.color || 'transparent',//背景色
        text: renderObj.text || '',//文字
        img: renderObj.img || null,//Image对象
        textDecoration: renderObj.textDecoration || {size:'1rem',family:'Roboto',align:'center',baseline:'auto',direction:'unset'},//**复合对象** 大小，字体，对齐方式，基线，文本方向，加粗，行高
        boxDecoration: renderObj.boxDecoration || {},//**复合对象** 圆角，阴影，渐变
        _flex: renderObj._flex || null,
        zIndex: renderObj.zIndex || null,
    }
    let radius;
    data.boxDecoration && data.boxDecoration.radius && (radius = data.boxDecoration.radius) || (radius = {});
    if(renderObj.type == 'rect' || 'text'){
        let border = data.border; 
        let shadow = data.boxDecoration.shadow;
        let gradient = data.boxDecoration.gradient;
        let txt = data.textDecoration;
        let domEle;
        renderObj.type === 'rect' && (domEle = document.createElement('div'));
        renderObj.type === 'text' && (domEle = document.createElement('span'));
        renderObj.type === 'input' && (domEle = document.createElement('input'));
        domEle.innerText = data.text;
        data._flex && (domEle.style.display = 'flex');
        domEle.style.cssText += `
            user-select: ${txt.selectable?'text':'none'};
            overflow: hidden;
            flex-shrink: 0;
            flex: 0 1 auto;
            width: ${data.width};
            height: ${data.height};
            border: ${border.type || 'solid'} ${border.width} ${border.color};
            background-color: ${data.color};
            font-size: ${txt.size};
            font-weight: ${txt.weight || 'normal'};
            font-family: ${txt.family};
            text-align: ${txt.align};
            vertical-align: ${txt.baseline};
            writing-mode: ${txt.direction};
            color: ${txt.color};
            line-height: ${txt.lineHeight || data.height};
        `;
        !!shadow && (shadow.inset && (domEle.style.cssText +=
            `box-shadow: inset ${shadow.offsetX || '0px'} ${shadow.offsetY || '0px'} ${shadow.blur || '0px'} ${shadow.color || 'rgba(0,0,0,0.16)'};`)
            || (domEle.style.cssText +=
            `box-shadow: ${shadow.offsetX || '0px'} ${shadow.offsetY || '0px'} ${shadow.blur || '0px'} ${shadow.color || 'rgba(0,0,0,0.16)'};`));
        !!radius && (domEle.style.cssText +=
        `border-radius: ${radius.lt} ${radius.rt} ${radius.rb} ${radius.lb};`);
        let colors = !!gradient ? (!!gradient.colors ?gradient.colors.toString() : 'rgba(0,0,0,0)'):'rgba(0,0,0,0)';
        !! gradient && gradient.type == 'linear'  && (domEle.style.cssText +=
        `background-image: linear-gradient(${gradient.deg || '90deg'},${colors})`);
        !! gradient && gradient.type == 'radial'  && (domEle.style.cssText +=
        `background-image: radial-gradient(${colors})`);
        domEle.style.flexShrink = '0';
        data.zIndex && (domEle.style.zIndex = data.zIndex);
        return domEle;
    }
    if(renderObj.type == 'img'){
        console.log(img);
        let img = data.img;
        !!data.width && (data.width !== 'fit-content' && (img.width = data.width));
        !!data.height && (data.height !== 'fit-content' && (img.height = data.height));
        img.draggable = false;
        !!radius && (img.style.cssText +=
        `border-radius: ${radius.lt} ${radius.rt} ${radius.rb} ${radius.lb};`);
        return img;
    }
}
Interface('Widget',{
    values:{
        type: 'Widget'
    },
    functions: ['build']
});
Interface('Rebuildable',{
    values:{},
    functions:['rebuild'],
});
Interface('State',{
    values:{},
    functions:['build','setState']
});

export const t_widget = Symbol('widget');

class Widget extends EClass{
    type = t_widget;
    domEle = null;
    renderObj = null;
    constructor(obj,...args){
        super(...args);
        this.renderObj = obj;
        this.domEle = render(this.renderObj);
        obj.disable && (this.domEle.style.cssText += "pointer-events: none");
    }
    _build(){
        return this.domEle;
    }
    drawRipple(x, y, color, onDrew,w,h,r) {
        this.domEle.style.position = 'relative';
        let d = document.createElement('div');
        d.style.cssText += `
        position: absolute;
        border-radius: 50%;
        transition: all 0.28s ease-out;
        width: ${r}px;
        height: ${r}px;
        top: ${y - r}px;
        left: ${x - r}px;
        background-color: ${color};
        `;
        w = parseInt(w);
        h = parseInt(h);
        this.domEle.appendChild(d);
        let re = w>h?w:h;
        let multi = re/r + 1;
        let dx = w/2 - (x-r) - r/2;
        let dy = h/2 - (y-r) - r/2;
        setTimeout(()=>{
            d.style.cssText += `transform: translate(${dx}px,${dy}px) scale(${multi},${multi});`;
        },10);
        d.addEventListener('transitionend',()=>{
            d.style.backgroundColor = 'transparent';
            d.addEventListener('transitionend',()=>{
                onDrew();
            });
        });
        return d;
    }
    clearRipple(ripple){
        ripple.remove();
        ripple = null;
    }
    align(str){
        this._build().style.alignSelf = str;
        return this;
    }
    addListener(id,handler){
        this._build().addEventListener(id,handler);
        return this;
    }
    bubble(eventTag,val){
        if(this.parent){
            if(!this.parent.events[eventTag]){
                throwError(CustomError(`父元素中没有定义叫做${eventTag}的catcher`));
            }else{
                this.parent.events[eventTag](val,this);
            }
        } 
    }
}
export class Container extends Widget{
    type = t_widget;
    constructor(obj){
        obj.type = 'rect';
        obj._flex = 'flex';
        super(obj);
        if(!!obj.children){
            for(let i = 0;i<obj.children.length;i++){
                let widget = obj.children[i];
                widget.type !== t_widget && throwError(CustomError('children中元素的类型应为Widget',errorHead))
                || (widget.parent = this);
                try{this.domEle.appendChild(obj.children[i]._build());}catch(e){}
            }
        }
        !obj.clip && (this.domEle.style.overflow = 'visible');
        this.domEle.style.position = 'relative';
        if(obj.catcher){
            !this.events && (this.events = {});
            const catcher = obj.catcher;
            for (const key in catcher) {
                if (Object.hasOwnProperty.call(catcher, key)) {
                    this.events[key] = catcher[key];
                }
            }
        }
    }
}
export class Text extends Widget{
    constructor(text,textDecoration){
        let obj = {
            type: 'text',
            text,
            textDecoration,
        }
        super(obj);
    }
}
export class Button extends Widget{
    _rippleColor = 'rgba(255,255,255,0.32)';
    _ripple = null;
    _timer1 = null;
    _timer2 = null;
    _widget = null;
    _shadow = null;
    onLongPress = null;
    info = {
        text:'',
        widget: null
    };
    constructor(text,obj){
        obj.width = obj.width || '56px',
        obj.height = obj.height || '32px',
        obj.text = text;
        obj.type = 'rect';
        super(obj);
        obj.leading && (this.domEle.innerHTML = `${obj.leading.domEle.outerHTML} ${this.domEle.innerHTML}`);
        obj.ending && (this.domEle.innerHTML = `${this.domEle.innerHTML} ${obj.ending.domEle.outerHTML}`);
        let layer = document.createElement('div');
        layer.style.cssText += `position: absolute;width: ${obj.width};height: ${obj.height};top:0px;left:0px;z-index:9999`;
        this.domEle.appendChild(layer);
        this._rippleColor = obj.rippleColor;
        this.onLongPress = obj.onlongpress || (() => false);
        this.info.text = obj.info || '';
        this.domEle.style.cursor = 'normal';
        this.domEle.onclick = () => {obj.onclick.call(this)};
        this.domEle.style.userSelect = 'none';
        this.domEle.style.textAlign = 'center',
        this.domEle.style.transition = 'all 0.24s ease-out';
        this.domEle.style.position = 'relative';
        let context = this;
        let _ripple = () => {return this._ripple;}
        let offsets = [];
        let getOffset = (e) => {
            offsets = [e.offsetX,e.offsetY];
        }
        let _drawRipple = () => {
            let ripple = _ripple();
            ripple = context.drawRipple(offsets[0] + 7,offsets[1] + 7,context._rippleColor,()=>{context.clearRipple(ripple)},obj.width,obj.height,14);
            clearTimeout(context._timer2);
            context._timer1 = setTimeout(() => {
                context.onLongPress.call(this);
            },1000);
        }
        let _mouseup = () => {
            clearTimeout(this._timer1);
        }
        layer.addEventListener('mousedown',getOffset);
        layer.addEventListener('mousedown',_drawRipple);
        layer.addEventListener('mouseup',_mouseup);
        layer.onmouseover = () => {
            this._timer2 = setTimeout(() => {
                this.info.text && (this.info.widget = this.showInfo());
            },1000);
        }
        layer.onmouseleave = () => {
            clearTimeout(this._timer2);
            this.info.widget && this.info.widget.remove();
        }
        let plate = document.createElement('div');
        plate.style.cssText += `
        position: relative;
        width: fit-content;
        height: fit-content;
        overflow: visible;
        display: flex;
        `;
        let widget = plate.attachShadow({mode:'closed'});
        widget.appendChild(this.domEle);
        this._shadow = widget;
        this._widget = plate;
    }
    showInfo(){
        //this.domEle.style.overflow = 'visible';
        let width = parseInt(this.renderObj.width);
        let color = this.renderObj.color;
        let info = document.createElement('div');
        info.style.cssText += `
        position: absolute;
        transform: translateX(calc(${width/2}px - 50%)) translateY(-120%);
        padding: 8px 12px;
        width: fit-content;
        height: fit-content;
        background-color: white;
        border-radius: 8px;
        box-shadow: 0px 2px 4px rgba(0,0,0,0.12);
        color: #222;
        text-align: center;
        line-height: 16px;
        `;
        info.innerText = this.info.text;
        this._shadow.appendChild(info);
        return info;
    }
    _build(){
        return this._widget;
    }
}
export class Img{
    type = t_widget;
    img = new Image();
    domEle = null;
    constructor(obj){
        this.img.src = obj.src;
        this.img.alt = obj.alt || obj.src;
        obj.width && (this.img.width = parseInt(obj.width));
        obj.height && (this.img.height = parseInt(obj.height));
        this.img.draggable = false;
        let defalutPh = new Widget({type:'rect',color:'gray',boxDecoration:obj.boxDecoration});
        let ph = obj.placeHolder || defalutPh;
        ph.domEle.style.width = obj.width;
        ph.domEle.style.height = obj.height;
        this.domEle = ph.domEle;
        this.img.onload = () => {
            this.domEle.parentNode.replaceChild(this.img,this.domEle);
            obj.loaded && obj.loaded();
            this.domEle.remove();
            this.domEle = null;
        }
        obj.loading && obj.loading();
    }
    _build(){
        return this.domEle;
    }
}
export class Icon{
    type = t_widget;
    domEle = null;
    constructor(src,width,height,radius/*RoundCorner*/){
        let img = new Image();
        img.src = src;
        img.width = parseInt(width);
        img.height = parseInt(height);
        radius && (img.style.borderRadius = radius.toString());
        this.domEle = img;
    }
    _build(){
        return this.domEle;
    }
    align(str){
        this._build().style.alignSelf = str;
        return this;
    }
}
export class Holder {
    type = t_widget;
    plate = document.createElement('div');
    proxy = null;
    constructor(widget,width,height){
        this.proxy = widget.domEle;
        let w = width || this.proxy.offsetWidth;
        let h = height || this.proxy.offsetHeight;
        this.plate.style.cssText += `width:${w};height:${h};overflow:show;display:flex;justify-content:center;align-items:center`;
        this.plate.appendChild(this.proxy);
    }
    _build(){
        return this.plate;
    }
    replace(widgetConstructor,...args){
        this.proxy.remove();
        this.proxy = widgetConstructor(...args).domEle;
        this.plate.appendChild(this.proxy);
    }
    align(str){
        this.plate.style.alignSelf = str;
        return this;
    }
}
export class Edit extends Widget{
    constructor(config){
        config.type = 'input';
        let highLight = config.highLight || 'gray';
        super(config);
        this.domEle.placeholder = config.hint || '';
        this.domEle.setAttribute('type',config.inner || 'text');
        this.domEle.value = config.value || '';
        config.autofocus && this.domEle.setAttribute('autofocus','');
        this.domEle.style.cssText += `
        outline:none;
        padding-left: 8px;
        padding-right:8px;
        border-left-width: 0px;
        border-right-width: 0px;
        border-top-width: 0px;
        border-bottom-width: 2px;
        background-color: ${config.color || '#eee'};
        border-bottom-color:${highLight};
        transition: all 0.2s ease-out;
        `;
        this.domEle.addEventListener('input',()=>{
            let val = this.domEle.value;
            config.onchange && config.onchange.call(this,val);
        });
        this.domEle.addEventListener('change',()=>{
            let val = this.domEle.value;
            config.onenter && config.onenter.call(this,val);
        })
        this.domEle.addEventListener('focus',()=>{
            this.domEle.style.cssText += `border-bottom-color:${config.focusColor || 'blue'};background-color: ${config.colorLight || '#fafafa'};`;
        });
        this.domEle.addEventListener('blur',()=>{
            this.domEle.style.cssText += `border-bottom-color:${highLight};background-color: ${config.color || '#eee'};`;
        });
    }
}
export class List extends Widget{
    data = null;
    constructor(obj){
        obj.type = 'rect';
        obj.direction = obj.direction || 'column';
        obj.direction === 'row' && !obj.height && throwError(CustomError('你必须为List设置高度','[SytanxError]'));
        obj.direction === 'column' && !obj.width && throwError(CustomError('你必须为List设置宽度','[SytanxError]'));
        super(obj);
        this.data = obj.data;
        this.direction = obj.direction === 'column' ?'row':'column';
        this.domEle.style.overflowY = 'auto';
    }
    builder(count,widgetConstructor){
        this.domEle.style.display = 'none';
        for(let i = 0;i<count;i++){
            let widget = widgetConstructor(i,this.data);
            !widget && throwError(CustomError('widgetConstructor必须返回一个Widget',errorHead));
            try{this.domEle.appendChild(widget._build())}catch(e){}
        }
        this.domEle.style.cssText += `display: flex;flex-direction: ${this.direction};`;
        return this;
    }
}
export class Activable extends Container{
    constructor(obj){
        let rippleColor = obj.rippleColor;
        obj.width = obj.width || '100px';
        obj.height = obj.height || '64px';
        let width = parseInt(obj.width);
        let height = parseInt(obj.height);
        super(obj);
        let layer = document.createElement('div');
        layer.style.cssText += `
        width: ${obj.width};
        height: ${obj.height};
        position: absolute;
        top: 0px;
        left: 0px;
        z-index: 999999;
        `;
        this.domEle.appendChild(layer);
        layer.addEventListener('mousedown',(e)=>{
            let r = width>height?height/4:width/4;
            if(rippleColor){
                let ripple = this.drawRipple(e.offsetX + r/2,e.offsetY + r/2,rippleColor,()=>{this.clearRipple(ripple)},obj.width,obj.height,r);
            }
        });
        for (const id in obj.events) {
            if (Object.hasOwnProperty.call(obj.events, id)) {
                const handler = obj.events[id];
                const func = (...args) => {handler.call(this,...args)}
                layer.addEventListener(id,func);
            }
        }
    }
}
export class State extends EClass{
    type = t_widget;
    holder = document.createElement('div');
    state = {}
    constructor(initState){
        super('State');
        this.holder.style.cssText += `
        width: 0px;
        height: 0px;
        `;
        initState && (this.state = initState);
    }
    setState(state){
        this.state = state;
        this.holder.innerHTML = '';
        this.holder.appendChild(this.build(this.state)._build());
        return this;
    }
    _build(){
        this.holder.innerHTML = '';
        this.holder.appendChild(this.build(this.state)._build());
        return this.holder;
    }
}
