'use strict';

import {throwError} from './core';

export class Queue{
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

export class Map{
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

export class Stack {
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

export class LinkedList {
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

export class ListNode {
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

export class TreeNode {
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

export class OrderQueue {
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
