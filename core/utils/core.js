'use strict';

let interfaces = {}

export const Interface = (name,data/* {values,functions} */) => {
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

export class EClass{
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

export const Enum = (...tags) => {
    let obj = {}
    for (let i = 0;i<tags.length;i++) {
        let tag = tags[i];
        obj[tag] = Symbol(tag);
    }
    return obj;
}

export class XHRMob{
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

const t_Ajax = Symbol('Ajax');

export class Ajax {
        type = t_Ajax;
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

export const throwError = (customError) => {
    typeof customError === 'function' && customError();
    typeof customError === 'string' && customError(str,'[Error]');
    return false;
}

export const CustomError = (str,head) => {
    head = head || "[Error]";
    str = str || "接口不能实例化";
    return function(){
        console.error(head + ' : ' + str);
    }
}