'use strict'

import { buildList } from "./widget.js";

const _URL = '175.24.121.133';
const PORT = 3000;
const on_open_msg = '连接成功';


let data = [];

let router = [];


export const ws = new WebSocket(`ws://${_URL}:${PORT}${router.length? '/' + router.join('/'): ''}`);
ws.addEventListener('open',()=>{
    console.log(`${on_open_msg}, url: ${_URL}, Port: ${PORT}`);
});
ws.addEventListener('message', me =>{
    console.log('ok');
    data.push(JSON.parse(me.data));
    buildList(data);
});