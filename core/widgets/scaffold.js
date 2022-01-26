'use strict';
import {Activable,Text,List,} from './widgets.js';
import {Column,Fixed,Sticky,Row} from './layout.js';
import {Shadow,Padding,Margin,} from './decoration.js';
import {Animate,getAnimated,Animates} from './animation.js';

export const AppBar = (configObj) => {
    let appBar = Padding([0,'12px'],new Column({
        width: 'calc(100vw - 24px)',
        height: configObj.large?'72px':'56px',
        color: configObj.color || 'rgba(0,122,204)',
        boxDecoration:{
            shadow: (configObj.showShadow === false)?Shadow(0,0,0,''):Shadow(0,'4px','6px','rgba(0,0,0,0.32)')
        },
        children:[
            new Column({
                height: '100%',
                children:[
                    Margin(configObj.large?['18px','10px']:'10px',configObj.leading || new Column({width:'36px',height:'36px'})),
                    Margin(configObj.large?['18px','10px']:['10px','10px'],new Text(configObj.title,{size: configObj.large?'24px':'20px',weight: 'bold',lineHeight: '36px',color: configObj.txtColor || '#222'}))
                ]
            }),
            Margin([0,'24px',0,0],configObj.ending ||
            new Column({
                width: 'fit-content',
                height: '100%'
            }))
        ]
    },'space-between'));
    configObj.sticky != false && (appBar = Sticky({},appBar));
    return appBar;
}

export const TabBar = (configObj) => {
    let data = configObj.data;
    return new List({
        direction: 'column',
        data,
        width: '100%',
        boxDecoration: configObj.boxDecoration,
    }).builder(data.length,configObj.tab);
}

export const Tab = (index,data) => {
    let Plate = null;
    let children = [];
    data[index].direction === 'row' && (Plate = Row) || (Plate = Column);
    data[index].icon && children.push(data[index].icon);
    data[index].text && children.push(data[index].text);
    let width = data[index].width?(parseInt(data[index].width) - 32 + 'px'):'68px';
    return new Activable({
        width: parseInt(width) + 32 + 'px',
        height: '48px',
        clip: true,
        rippleColor: data[index].rippleColor || 'rgba(0,0,0,0.16)',
        children:[
            Padding(['8px','16px'],new Plate({
                width,
                children,
            },'center'))
        ]
    });
}

export const Drawer = (configObj) => {

    let width = configObj.width || 'fit-content';
    let color = configObj.color || 'white';
    let boxDecoration = configObj.boxDecoration || {shadow:Shadow('8px',0,'8px','rgba(0,0,0,0.2)')};
    let drawer = Animate('_drawer',new Row({
        height: '100vw',
        width,
        color,
        boxDecoration,
        children: configObj.content || [new Row({})]
    }));
    let controller = getAnimated('_drawer');
    let _fold = controller.createState({
        time: '0.2s',
        func: 'ease-out',
        anims:{
            [Animates.translate]: ['calc(-100% - 12px)',0]
        }
    });
    let _open = controller.createState({
        time: '0.24s',
        func: 'linear',
        anims:{
            [Animates.translate]: ['0px',0]
        }
    });
    !configObj.open &&  controller.set(_fold);
    class _Row extends Row{
        constructor(...paras){
            super(...paras);
        }
        setState(state){
            const open = state.open;
            if(open){
                controller.to(_open);
            }else{
                controller.to(_fold);
            }
        }
    }
    let _drawer = new _Row({
        children:[drawer]
    });
    configObj.fixed && (_drawer = Fixed({},_drawer));
    return _drawer;
}

export const Scaffold = (configObj) => {
    let appBar = configObj.appBar || null;
    let tabBar = configObj.tabBar || null;
    let drawer = configObj.drawer || null;
    let navigator = configObj.navigator || null;
    let body = configObj.body || null;
    let children = [];
    body && children.push(body);
    appBar && children.push(appBar);
    tabBar && children.push(tabBar);
    drawer && children.push(drawer);
    navigator && children.push(navigator);
    return new Row({
        width: '100vw',
        height: '100vh',
        children,
    });
}