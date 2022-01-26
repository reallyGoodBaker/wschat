'use strict';

export const Padding = (array,widget) => {
    widget._build().style.padding = array.toString().replace(/,/g,' ');
    return widget;
}
export const Margin = (array,widget) => {
    widget._build().style.margin = array.toString().replace(/,/g,' ');
    return widget;
}
export const Shadow = (offsetX,offsetY,blur,color,boolInset) => {
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
export const Radius = (lt,rt,rb,lb) => {
    return {lt,rt,rb,lb}
}
export const RadiusAll = (r) => {
    return Radius(r,r,r,r);
}