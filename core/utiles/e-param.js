'use strict';

import { EClass, throwError } from "./core.js";

function _getFuncFParam(func) {
    let str = func.toString();
    let clip = str.replace(/function.*\(.*\)/,'');
    str = str.replace(clip,'');
    str = str.replace(/function.*\(/, '');
    str = str.replace(/\)/,'');
    return str.split(',');
}

function _getArrowFParam(func){
    let str = func.toString();
    str = str.match(/\(.*\)/,'')[0];
    str = str.replace('(','');
    str = str.replace(')','');
    return str.split(',');
}

function getFormalParam(func) {
    if (typeof func === 'function') {
        if ('function' === func.toString().slice(0, 8)) {
            return _getFuncFParam(func);
        } else if(func.toString().includes('=>')){
            return _getArrowFParam(func);
        }
    }else{
        return throwError('getFormalParam只接受一个函数');
    }
}

function isConfigObj(eparam,normalparam){
    if(normalparam.length === 1||eparam.length !== 1){
        return false;
    }else if(eparam.length === 1){
        return EClass.isObject(eparam[0]);
    }
}

function generateParams(eparam,normalparam){
    let params = [];
    for(let i = 0; i < normalparam.length; i++){
        let param = eparam[normalparam[i]];
        if(param !== undefined){
            params.push(param);
        }else{
            params.push(undefined);
        }
    }
    return params;
}

export const paramEnhance = (func) => {
    let _func = func;
    func = function(...eparams){
        let normalparam = getFormalParam(_func);
        if(isConfigObj(eparams,normalparam)){
            let params = generateParams(eparams[0],normalparam);
            return _func.apply(_func,params);
        }else{
           return  _func.apply(_func,eparams);
        }
    } 
    return func;
}