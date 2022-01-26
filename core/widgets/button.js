'use strict';
import {Button} from './widgets.js';
import {RadiusAll,Shadow} from './decoration.js';
export const TextButton = (text,obj) => {
    let {onclick,onlongpress,color,txtColor,rippleColor,width,height,info,leading,ending,radius} = obj;
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
                lineHeight: height,
                weight: 'bold',
            },
            boxDecoration:{
                radius: RadiusAll(radius || '8px'),
            }
        }
    );
    return btn;
}
export const FloatButton = (text,obj) => {
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