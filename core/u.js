'use strict';

export const  U = (() => {
//START

let interfaces = {}

 const Interface = (name,data/* {values,functions} */) => {
    typeof name !== 'string' && throwError('Interface第一个参数应该为一个字符串');
    if(!EClass.isObject(data)){
        throwError(
`data应该是一个由常量集合与函数名列表组成的集合,例：\n{\n    values: {\n        NAME: Lee,\n        AGE: 20\n    },\n    functions: ['name','age','sexual']\n}`);
    }else{
        let values = Object.create(data.values) || {};
        let functions = Object.create(data.functions) || [];
        for (const key in values) {
            let v = values[key];
            Object.defineProperty(values,key,{
                set(){
                    throwError(CustomError('不能修改接口中的常量','[SyntaxError] : '));
                },
                get(){
                    return v;
                },
                enumerable: true
            });
        }
        let int = interfaces;
        int[name] = Object.assign(values,{functions});
    }
    return CustomError("你不能实例化接口",'[SyntaxError] : ');
}

 class EClass{
    constructor(...args){
        let hasProto = (obj) => {
            return Object.getPrototypeOf(obj) !== (Object.prototype || Function.prototype) ;
        }
        let getProto = (obj) => {
            return obj.__proto__ || Object.getPrototypeOf(obj);
        }
        if(!!args.toString()){
            let itfs = [];
            for (const key in args) {
                let accurKey = args[key];
                interfaces[accurKey] !== undefined &&
                (itfs[key] = interfaces[accurKey]) ||
                throwError(CustomError('没有声明过此接口:\n ' + accurKey ,'[SyntaxError]'));
            }
            for (let i = 0; i  < itfs.length; i++) {
                let itf = itfs[i];
                for (const key in itf) {
                    let val = itf[key];
                    key !== 'functions'
                    && Object.defineProperty(this,key,{
                        set(){
                            throwError(CustomError('不能修改接口中的常量','[SyntaxError]'));
                        },
                        get(){
                            return val;
                        }
                    });
                    if (key === 'functions') {
                        let proto = getProto(this);
                        let funcs = Object.getOwnPropertyNames(proto);
                        let unOverride = val;
                        for(;!!funcs;){
                            for(let i in funcs){
                                let index = unOverride.indexOf(funcs[i]);
                                index !== -1 && unOverride.splice(index,1);
                            }
                            proto = hasProto(proto) ? getProto(proto) : null;
                            funcs = !!proto ? Object.getOwnPropertyNames(proto) : null;
                        }
                        unOverride.length != 0 && throwError(CustomError('以下方法需要覆写:\n' + unOverride.toString(),'[SyntaxError]'));
                    }
                }
            }
        }
    }
    static isObject(arg){
        return typeof arg === 'object' ? (!!arg) : false;
    }
}

 const Enum = (...tags) => {
    let obj = {}
    for (let i = 0;i<tags.length;i++) {
        let tag = tags[i];
        obj[tag] = Symbol(tag);
    }
    return obj;
}

let throwError = (customError) => {
    typeof customError === 'function' && customError();
    typeof customError === 'string' && customError(str,'[Flat]');
}

let CustomError = (str,head) => {
    head = head || "[Flat]";
    str = str || "接口不能实例化";
    return function(){
        console.error(head + ' : ' + str);
    }
}

const NULL  =  () => {
    return Object.create(null);
}

class XHRMob{
/*
*   NOTE:使用XHRMob，请使用一个类继承XHRMob并覆写 onRespond 和 onError 方法
*   其中，onRespond 方法有一个参数 recev ,这个参数就是解析出的字符串变量，您可以对其进行操作
*   onError 方法有一个参数 code，这个参数实际上就是XMLHttpRequest.status
*/
    #prepare = () => {
        let x = this.xhr;
        x.onreadystatechange = () => {
            if(x.readyState === 4){
                if((x.status >= 200 && x.status < 300) || x.status == 0){
                    this.recev = x.response;
                    this.onRespond(this.recev);
                }else{
                    this.onError(x.status);
                }
            }
        }
    }
    constructor(){
        this.#prepare();
    }
    xhr = new XMLHttpRequest();
    url = "";
    name = "";
    passwd = "";
    recev = '';
    header = {};
    responType = 'text';
    onRespond = (recev) => {}
    onError = (code) => {}
    setHeader(id,str){
        this.header[id] = str;
        return this;
    }
    setHeaders(obj){
        EClass.isObject(obj) && Object.assign(this.header,obj);
        return this;
    }
    #setHeader = () => {
        for (const key in this.header) {
            this.xhr.setRequestHeader(key,this.header[key]);
        }        
    }
    setURL(str){
        this.url = str;
        return this;
    }
    setResponseType(str){
        this.responType = str;
        return this;
    }
    setLoginInfo(name,passwd){
        this.name = name;
        this.passwd = passwd;
        return this;
    }
    get(){
        this.#open('GET');
    }
    post(data){
        this.#open('POST',data);
    }
    #open = (str,data) => {
        this.xhr.open(str,this.url,true,this.name,this.passwd);
        this. #setHeader();
        this.xhr.responseType = this.responType;
        this.xhr.send(data);
        return this;
    }
}

class Ajax {
    handlers = [
        /*waiting*/0,
        /*error*/ (code)=>{throw `Network Error: ${code}`;},
        /*resolve*/ (data)=>{console.log('done');}
    ]
    static states = {
        waiting: 0,
        respone: 1,
        error: 2,
    }
    constructor(url,config){
        !!!config && (config={});
        config = {
            method: config.method || 'get',
            headers: config.headers || {},
            data: config.data || '',
            responseType: config.responseType || 'text',
        }
        Object.defineProperty(this,'state',{
            get(){
                return this._value;
            },
            set(val){
                this._value = val.state;
                val.handler(val.arg);
            },
            _value: 0
        });
        let xhr = new XHRMob();
        xhr.setURL(url);
        xhr.setHeaders(config.headers);
        xhr.setResponseType(config.responseType);
        xhr.onError = (code) => {
            this.state = {state:1,handler: this.handlers[1],arg:code};
        }
        xhr.onRespond = (data) => {
            this.state = {state:2,handler: this.handlers[2],arg:data};
        };
        try{
            switch (config.method.toLowerCase()) {
                case 'get': xhr.get(); break;
                case 'post': xhr.post(config.data);break;
            }
        }catch(e){
            throw e;
        }
    }
    then(responed,error){
        responed && (this.handlers[2] = responed);
        error && (this.handlers[1] = error);
        return this;
    }
}

class Queue{
    maxLength = 1;
    queue = new Array();
    setMax(int) {
        this.maxLength = int;
        return this;
    }
    add(obj) {
        if (this.maxLength > this.queue.length) {
            this.queue.push(obj);
            return this;
        } else {
            throwError("You can not add element to a full queue");
        }
    }
    loop() {
        return this.queue.shift();
    }
    getLength() {
        return this.queue.length;
    }
}

class Map{
    map = {}
    index = new Array();
    async add(key, value) {
        this.map[key] = value;
        this.index.push(key);
        return this;
    }
    get(key) {
        return this.map[key];
    }
    getKey(value) {
        let output = new Array();
        for (let i = 0; i < this.index.length; i++) {
            let accrKey = this.index[i];
            if (this.map[accrKey] === value) {
                output.push(accrKey);
            }
        }
        return output;
    }
    getAll = () => {
        let output = new Array();
        for (let i = 0; i < this.index.length; i++) {
            let accrKey = this.index[i];
            output.push(this.map[accrKey]);
        }
        return output;
    }
}

class Stack {
    stack = [];
    push(...obj){
        this.stack.push(...obj);
        return this;
    }
    peek(){
        return this.stack[this.stack.length - 1];
    }
    pop(){
        return this.stack.pop();;
    }
    getCount(){
        return this.stack.length;
    }
}

class LinkedList {
    list = {}
    index = 0;
    createNode(){
        let node =  new this.ListNode();
        node.id = this.index++;
        this.list[node.id] = node;
        return node;
    }
    getNode(id){
        return this.list[id];
    }
    insert(node,id){
        let n = this.getNode(id);
        let next = n.getNext();
        node.setNext(next);
        n.setNext(node);
        return this;
    }
    remove(id){
        let n = this.getNode(id);
        let pre =  n.getPrev();
        let nex = n.getNext();
        pre.setNext(nex);
        return this;
    }
    ListNode = class{
        prev = null;
        next = null;
        data = null;
        id  = 0;
        setNext(obj){
            this.next = obj;
            obj.setPrev(this);
            return this;
        }
        setPrev(node){
            this.prev = node;
            return this;
        }
        setData(obj){
            this.data = obj;
            return this;
        }
        getNext(){
            return this.next;
        }
        getPrev(){
            return this.prev;
        }
        getData(){
            return this.data;
        }
    }
}

class ListNode {
    prev = null;
    next = null;
    data = null;
    id  = 0;
    setNext(obj){
        this.next = obj;
        obj.setPrev(this);
        return this;
    }
    setPrev(node){
        this.prev = node;
        return this;
    }
    setData(obj){
        this.data = obj;
        return this;
    }
    getNext(){
        return this.next;
    }
    getPrev(){
        return this.prev;
    }
    getData(){
        return this.data;
    }
}

class TreeNode {
    parent = null;
    children = [];
    getParent(){
        return this.parent;
    }
    addChild(obj){
        obj.parent = this;
        this.children.push(obj);
        return this;
    }
    getChildren(){
        return this.children;
    }
}

class OrderQueue {
    stack = new Queue().setMax(20);
    setMax(int){
        this.stack.setMax(int);
        return this;
    }
    add(func){
        this.stack.add(func);
        return this;
    }
    execute(...args){
        let count = this.stack.getLength();
        for(let i = 0;i < count; i ++){
            let f = this.stack.loop();
            typeof f === "function" && f(...args);
        }
    }
}

//Views
const errorHead = '[U]';

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

//let app = document.body.attachShadow({mode:'open'});
const mount = (widget) => {
    app.appendChild(widget._build());
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
let t_widget = Symbol('widget');

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
}

class State extends EClass{
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

class Container extends Widget{
    constructor(obj){
        obj.type = 'rect';
        obj._flex = 'flex';
        super(obj);
        if(!!obj.children){
            for(let i = 0;i<obj.children.length;i++){
                let widget = obj.children[i];
                widget.type !== t_widget && throwError(CustomError('children中元素的类型应为Widget',errorHead));
                try{this.domEle.appendChild(obj.children[i]._build());}catch(e){}
            }
        }
        !obj.clip && (this.domEle.style.overflow = 'visible');
        this.domEle.style.position = 'relative';
    }
}

let Shadow = (offsetX,offsetY,blur,color,boolInset) => {
    offsetX = offsetX || 0;
    offsetY = offsetY || 0;
    blur = blur || 0;
    color = color || 'rgba(0,0,0,0.16)';
    boolInset = boolInset?true:false;
    return {
        offsetX,
        offsetY,
        blur,
        color,
        inset: boolInset
    }
}

const Radius = (lt,rt,rb,lb) => {
    return {lt,rt,rb,lb}
}

const RadiusAll = (r) => {
    return Radius(r,r,r,r);
}

const Center = (widget) => {
    widget._build().style.cssText += "position: absolute; top: 50%; left: 50%; transform: translateX(-50%) translateY(-50%)";
    return widget;
}

class Text extends Widget{
    constructor(text,textDecoration){
        let obj = {
            type: 'text',
            text,
            textDecoration,
        }
        super(obj);
    }
}

let Rotation = (deg,widget) => {
    let txt = ` rotate(${deg}deg)`;
    widget._build().style.transform
    && (widget._build().style.transform = 'transform:' + txt )
    || (widget._build().style.transform += txt);
    return widget;
}

let Positioned = (config,widget) => {
    widget._build().style.position = 'absolute';
    widget._build().style.cssText += `
        top: ${config.top || 0};
        left: ${config.left || 0};
        right: ${config.right || 'auto'};
        bottom : ${config.bottom || 'auto'};
    `;
    return widget;
}

let Fixed = (config,widget) => {
    widget._build().style.position = 'fixed';
    widget._build().style.cssText += `
        top: ${config.top || 0};
        left: ${config.left || 0};
        right: ${config.right || 'auto'};
        bottom : ${config.bottom || 'auto'};
    `;
    return widget;
}

let Sticky = (config,widget) => {
    widget._build().style.position = 'sticky';
    widget._build().style.cssText += `
        top: ${config.top || 0};
        left: ${config.left || 0};
        right: ${config.right || 'auto'};
        bottom : ${config.bottom || 'auto'};
    `;
    return widget;
}

let Align = (str,widget) => {
    return widget.align(str);
}

class Column extends Container{
    constructor(obj,str,bool){
        super(obj);
        this.domEle.style.flexDirection = 'row';
        this.domEle.style.justifyContent = str || 'left';
        bool && (this.domEle.style.flexDirection = 'row-reverse');
    }
}

class Row extends Container{
    constructor(obj,str,bool){
        super(obj);
        this.domEle.style.flexDirection = 'column';
        this.domEle.style.justifyContent = str || 'left';
        bool && (this.domEle.style.flexDirection = 'column-reverse');
    }
}

class Activable extends Container{
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
                layer.addEventListener(id,handler);
            }
        }
    }
}

class Button extends Widget{
    _rippleColor = 'rgba(255,255,255,0.32)';
    _ripple = null;
    _timer1 = null;
    _timer2 = null;
    _widget = null;
    _shadow = null;
    onLongPress = null;
    info = {
        text:'',
        widget:null
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
        this.domEle.onclick = obj.onclick;
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
                context.onLongPress();
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

class Img{
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

class Icon{
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
}

let Padding = (array,widget) => {
    widget.domEle.style.padding = array.toString().replace(/,/g,' ');
    return widget;
}

let Margin = (array,widget) => {
    widget.domEle.style.margin = array.toString().replace(/,/g,' ');
    return widget;
}

let TextButton = (text,obj) => {
    let {onclick,onlongpress,color,txtColor,rippleColor,width,height,info,leading,ending} = obj;
    let btn = new Button(
        text,
        {
            leading,
            ending,
            info,
            width,
            height,
            rippleColor,
            onclick,
            color: color || 'transparent',
            onlongpress,
            border:{
                color: txtColor,
                width: obj.outline ? '2px' : '0px',
            },
            textDecoration:{
                color: txtColor,
                lineHeight: this.height,
                weight: 'bold',
            },
            boxDecoration:{
                radius: RadiusAll('8px'),
            }
        }
    );
    return btn;
}

let FloatButton = (text,obj) => {
    let {onclick,onlongpress,color,txtColor,rippleColor,width,height,info,leading,ending} = obj;
    let btn = new Button(
        text,
        {
            leading,
            ending,
            info,
            width,
            height,
            rippleColor,
            onclick,
            color,
            onlongpress,
            border:{
                color: txtColor,
                width: obj.outline ? '2px' : '0px',
            },
            textDecoration:{
                color: txtColor,
                lineHeight: height,
                weight: 'bold',
            },
            boxDecoration:{
                radius: RadiusAll('8px'),
                shadow: Shadow('0px','2px','4px','rgba(0,0,0,0.16)',false),
            }
        }
    );
    let active = ()=> {
        btn.domEle.style.boxShadow = "0px 8px 8px rgba(0,0,0,0.2)";
    }
    let deactive = () => {
        btn.domEle.style.boxShadow = '0px 2px 4px rgba(0,0,0,0.16)';
    }
    btn.domEle.addEventListener('mousedown',active);
    btn.domEle.addEventListener('touchstart',active);
    btn.domEle.addEventListener('touchend',deactive);
    btn.domEle.addEventListener('mouseup',deactive);
    btn.domEle.addEventListener('mouseleave',deactive);
    return btn;
}


let animates = {}

let Animate = (id,widget) => {
    !!animates[id] && throwError(CustomError('id重复','[SytanxError]')) || (animates[id] = widget._build());
    return widget;
}

const Animates = Enum(
    'translate','scale','rotate','opacity','filter','backgroundColor','txtColor','shadow'
);

let getAnimated = (id) => {
    let target = null;
    animates[id] && (target = animates[id]);
    let onEnded = () => {}
    return {
        target,
        createState: (config) => {
            let conf = {
                time: config.time || null,
                timingFunction: config.func || 'linear',
                anims: {
                    [Animates.translate]: config.anims[Animates.translate] || [],
                    [Animates.scale]: config.anims[Animates.scale] || [],
                    [Animates.rotate]: config.anims[Animates.rotate] || 0,
                    [Animates.opacity] :config.anims[Animates.opacity] || 1,
                    [Animates.filter] :config.anims[Animates.filter] || null,
                }
            }
            config.anims[Animates.backgroundColor] && (conf.anims[Animates.backgroundColor] = config.anims[Animates.backgroundColor]);
            config.anims[Animates.txtColor] && (conf.anims[Animates.txtColor] = config.anims[Animates.txtColor]);
            return conf;
        },
        onended: (handler) => {
            onEnded = handler;
            return this;
        },
        set:(fromState)=>{
            if(fromState){
                target.style.cssText += `
                transform: translate(${fromState.anims[Animates.translate].toString() || '0px,0px'}) scale(${fromState.anims[Animates.scale].toString() || '1,1'}) rotate(${fromState.anims[Animates.rotate] || '0deg'});
                opacity: ${fromState.anims[Animates.opacity]};
                filter: ${fromState.anims[Animates.filter]};
                `;
                fromState.anims[Animates.backgroundColor] && (target.style.cssText += `background-color: ${fromState.anims[Animates.backgroundColor]};`);
                fromState.anims[Animates.txtColor] && (target.style.cssText += `color: ${fromState.anims[Animates.txtColor]};`);
                fromState.anims[Animates.shadow] && (target.style.boxShadow = fromState.anims[Animates.shadow]);
            }
        },
        to:(toState)=>{
            target.style.transition = `all ${toState.time} ${toState.timingFunction}`;
            setTimeout(()=>{
                let anims = toState.anims;
                target.style.cssText += `
                transform: translate(${anims[Animates.translate].toString() || '0px,0px'}) scale(${anims[Animates.scale].toString() || '1,1'}) rotate(${anims[Animates.rotate] || '0deg'});
                opacity: ${anims[Animates.opacity]};
                filter: ${anims[Animates.filter]};
                `;
                anims[Animates.backgroundColor] && (target.style.cssText += `background-color: ${anims[Animates.backgroundColor]};`);
                anims[Animates.txtColor] && (target.style.cssText += `color: ${anims[Animates.txtColor]};`);
                anims[Animates.shadow] && (target.style.boxShadow = anims[Animates.shadow]);
            },10);
        },
        play:(toState,fromState) => {
            target.style.transition = null;
            if(fromState){
                target.style.cssText += `
                transform: translate(${fromState.anims[Animates.translate].toString() || '0px,0px'}) scale(${fromState.anims[Animates.scale].toString() || '1,1'}) rotate(${fromState.anims[Animates.rotate] || '0deg'});
                opacity: ${fromState.anims[Animates.opacity]};
                filter: ${fromState.anims[Animates.filter]};
                `;
                fromState.anims[Animates.backgroundColor] && (target.style.cssText += `background-color: ${fromState.anims[Animates.backgroundColor]};`);
                fromState.anims[Animates.txtColor] && (fromState.anims[Animates.txtColor] = fromState.anims[Animates.txtColor]);
            }
            let onend = () => {
                target.removeEventListener('transitionend',onend);
                onEnded.call(target);
            }
            target.addEventListener('transitionend',onend);
            setTimeout(()=>{
                target.style.transition = `all ${fromState.time || toState.time} ${fromState.timingFunction || toState.timingFunction}`;
                setTimeout(()=>{
                    let anims = toState.anims;
                    target.style.cssText += `
                    transform: translate(${anims[Animates.translate].toString() || '0px,0px'}) scale(${anims[Animates.scale].toString() || '1,1'}) rotate(${anims[Animates.rotate] || '0deg'});
                    opacity: ${anims[Animates.opacity]};
                    filter: ${anims[Animates.filter]};
                    `;
                    anims[Animates.backgroundColor] && (target.style.cssText += `background-color: ${anims[Animates.backgroundColor]};`);
                    anims[Animates.txtColor] && (target.style.cssText += `color: ${anims[Animates.txtColor]};`);
                },10)
            },10);
        },
    }
}

class Holder {
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
    replace(widgetConstructor){
        this.proxy.remove();
        this.proxy = widgetConstructor().domEle;
        this.plate.appendChild(this.proxy);
    }
    align(str){
        this.plate.style.alignSelf = str;
        return this;
    }
}

class Edit extends Widget{
    constructor(config){
        config.type = 'input';
        let highLight = config.highLight || 'gray';
        super(config);
        this.domEle.placeholder = config.hint || '';
        this.domEle.setAttribute('type',config.inner || 'text');
        this.domEle.value = config.value || '';
        this.domEle.style.cssText += `
        outline:none;
        padding-left: 8px;
        padding-right:8px;
        border-left-width: 0px;
        border-right-width: 0px;
        border-top-width: 0px;
        border-bottom-width: 2px;
        background-color: #eee;
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
            this.domEle.style.cssText += `border-bottom-color:blue;background-color: #fafafa;`;
        });
        this.domEle.addEventListener('blur',()=>{
            this.domEle.style.cssText += `border-bottom-color:${highLight};background-color: #eee;`;
        });
    }
}

class List extends Widget{
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

class MediaPlayer {
    audio = null;
    context = null;
    source = null;
    constructor(obj){
        this.audio = new Audio();
        const AudioContext = window.AudioContext || window.webkitAudioContext || window.mozAudioContext || window.msAudioContext;
        this.context = new AudioContext();
        this.source = this.context.createMediaElementSource(this.audio);
        this.audio.src = obj.src;
        this.audio.loop = obj.loop || 'false';
        Object.defineProperty(this,'currentTime',{
            get: () => {
                return this.audio.currentTime;
            },
            set: (val) => {
                this.audio.currentTime = val;
            }
        });
        for (const id in obj.events) {
            if (Object.hasOwnProperty.call(obj.events, id)) {
                const handler = obj.events[id];
                this.audio.addEventListener(id,handler);
            }
        }

    }
    play(){
        this.audio.play();
    }
    pause(){
        this.audio.pause();
    }
}

//END
const __modules__ = {
    interfaces,
    Interface,
    Enum,
    throwError,
    CustomError,
    NULL,
    XHRMob,
    EClass,
    Ajax,
    Queue,
    Map,
    Stack,
    LinkedList,
    ListNode,
    TreeNode,
    OrderQueue,
    //Widgets
    //Container,
    mount,
    //unmount, *** 
    Shadow,
    Radius,
    RadiusAll,
    Center,
    Text,
    Rotation,
    Positioned,
    Row,
    Column,
    Button,
    Align,
    Padding,
    Margin,
    TextButton,
    FloatButton,
    Animate,
    Animates,
    getAnimated,
    Img,
    Icon,
    Holder,
    Edit,
    State,
    Fixed,
    Sticky,
    List,
    MediaPlayer,
    Activable,
}

return __modules__;

})();