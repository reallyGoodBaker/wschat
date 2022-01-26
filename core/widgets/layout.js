'use strict';

import {Container} from './widgets.js';

export class Column extends Container{
    constructor(obj,str,bool){
        super(obj);
        this.domEle.style.flexDirection = 'row';
        this.domEle.style.justifyContent = str || 'left';
        bool && (this.domEle.style.flexDirection = 'row-reverse');
    }
}
export class Row extends Container{
    constructor(obj,str,bool){
        super(obj);
        this.domEle.style.flexDirection = 'column';
        this.domEle.style.justifyContent = str || 'left';
        bool && (this.domEle.style.flexDirection = 'column-reverse');
    }
}
export const Center = (widget) => {
    widget._build().style.cssText += "position: absolute; top: 50%; left: 50%; transform: translateX(-50%) translateY(-50%)";
    return widget;
}
export const Rotation = (deg,widget) => {
    let txt = ` rotate(${deg}deg)`;
    widget._build().style.transform
    && (widget._build().style.transform = 'transform:' + txt )
    || (widget._build().style.transform += txt);
    return widget;
}
export const Positioned = (config,widget) => {
    widget._build().style.position = 'absolute';
    config.top && (widget._build().style.top = config.top);
    config.left && (widget._build().style.left = config.left);
    config.right && (widget._build().style.right = config.right);
    config.bottom && (widget._build().style.bottom = config.bottom);
    return widget;
}
export const Fixed = (config,widget) => {
    widget._build().style.position = 'fixed';
    widget._build().style.cssText += `
        top: ${config.top || 0};
        left: ${config.left || 0};
        right: ${config.right || 'auto'};
        bottom : ${config.bottom || 'auto'};
    `;
    return widget;
}
export const Sticky = (config,widget) => {
    widget._build().style.position = 'sticky';
    widget._build().style.cssText += `
        top: ${config.top || 0};
        left: ${config.left || 0};
        right: ${config.right || 'auto'};
        bottom : ${config.bottom || 'auto'};
    `;
    return widget;
}
export const Align = (str,widget) => {
    return widget.align(str);
}