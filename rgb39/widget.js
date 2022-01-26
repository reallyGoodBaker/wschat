'use strict';

import { Edit, Row, Text, TextDecoration } from '../core/widgets/builders.js';
import { Margin, Padding, RadiusAll } from '../core/widgets/decoration.js';
import { Positioned } from '../core/widgets/layout.js';
import { State, List } from '../core/widgets/widgets.js';
import { ws } from './ws.js';

class MyList extends State {
    constructor() {
        super();
    }
    build(data) {
        return new List({
            direction: 'row',
            height: 'calc(100vh - 60px)',
            width: '100vw',
            data: data
        }).builder(data.length, (index, data) => {
            return Margin('8px',Padding('8px',Row({
                color: data[index].color,
                boxDecoration: {
                    radius: RadiusAll('8px'),
                },
                children: [
                    Text({
                        text: data[index].data,
                        color: 'white',
                        textDecoration: TextDecoration({
                            size: '24px',
                            lineHeight: '32px',
                            color: 'white'
                        })
                    })
                ]
            })))
        });
    }
}

export let myList = new MyList([]);

export const buildList = (data) => {
    return myList.setState(data);
}

export let nav = Positioned({left:'0px',top:'calc(100vh - 64px)'},Edit({
    width:'98vw',
    height:'56px',
    hint: '聊些啥',
    textDecoration:{
        align: 'left'
    },
    onenter: function(val) {
        this.domEle.value = '';
        ws.send(val);
    }
}))