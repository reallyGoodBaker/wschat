'use strict';
import {paramEnhance} from '../utils/e-param.js';
import * as widgets from './widgets.js';
import * as layout from './layout.js';

let _Button = (width,height,border,color,text,textDecoration,boxDecoration,zIndex,info,leading,ending,rippleColor,onlongpress,onclick) => {
    return new widgets.Button(text,{width,height,border,color,textDecoration,boxDecoration,zIndex,info,leading,ending,rippleColor,onlongpress,onclick})
}
_Button = paramEnhance(_Button);
export const Button = _Button;

let _Container = (width,height,border,color,boxDecoration,zIndex,clip,children) => {
    return new widgets.Container({width,height,border,color,boxDecoration,zIndex,clip,children});
}
_Container = paramEnhance(_Container);
export const Container = _Container;

let _Edit = (width,height,zIndex,onchange,onenter,hint,value,$inner,color,colorLight,focusColor,textDecoration,autofocus) => {
    let inner = $inner;
    return new widgets.Edit({width,height,zIndex,onchange,onenter,hint,value,inner,color,colorLight,focusColor,textDecoration,autofocus});
}
_Edit = paramEnhance(_Edit);
export const Edit = _Edit;

let _Holder = (widget,width,height) => {
    return new widgets.Holder(widget,width,height);
};
_Holder = paramEnhance(_Holder);
export const Holder = _Holder;

let _Icon = (src,width,height,radius) => {
    return new widgets.Icon(src,width,height,radius);
};
_Icon = paramEnhance(_Icon);
export const Icon = _Icon;

let _Img = (src,alt,width,height,placeHolder,loaded) => {
    return new widgets.Img({src,alt,width,height,placeHolder,loaded});
};
_Img = paramEnhance(_Img);
export const Img = _Img;

let _List = (width,height,border,color,boxDecoration,zIndex,clip,data,direction) => {
    return new widgets.List({width,height,border,color,boxDecoration,zIndex,clip,data,direction});
};
_List = paramEnhance(_List);
export const List = _List;

let _Text = (text,textDecoration) => {
    return new widgets.Text(text,textDecoration);
};
_Text = paramEnhance(_Text);
export const Text = _Text;

let _textDecoration = (size,family,align,baseline,direction,weight,color,lineHeight) => {
    return {size,family,align,baseline,direction,weight,color,lineHeight}
}
_textDecoration = paramEnhance(_textDecoration);
export const TextDecoration = _textDecoration;

let _boxDecoration = (shadow,gradient,radius) => {
    return {shadow,gradient,radius}
}
_boxDecoration = paramEnhance(_boxDecoration);
export const BoxDecoration = _boxDecoration;

let _Row = (width,height,border,color,boxDecoration,zIndex,clip,children,justify,reverse) => {
    return new layout.Row({width,height,border,color,boxDecoration,zIndex,clip,children},justify,reverse);
}
_Row = paramEnhance(_Row);
export const Row = _Row;

let _Column = (width,height,border,color,boxDecoration,zIndex,clip,children,justify,reverse) => {
    return new layout.Column({width,height,border,color,boxDecoration,zIndex,clip,children},justify,reverse);
}
_Column = paramEnhance(_Column);
export const Column = _Column;