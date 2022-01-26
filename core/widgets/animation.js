'use strict';

import {Enum} from '../utils/core.js';

let animates = {}

export const Animate = (id,widget) => {
    !!animates[id] && throwError(CustomError('id重复','[SytanxError]')) || (animates[id] = widget._build());
    return widget;
}

export const Animates = Enum(
    'translate','scale','rotate','opacity','filter','backgroundColor','txtColor','shadow'
);

export const getAnimated = (id) => {
    let target = null;
    animates[id] && (target = animates[id]);
    let onEnded = () => {}
    return {
        target,
        createState: (config) => {
            let conf = {
                time: config.time || null,
                timingFunction: config.func || 'linear',
                anims: {
                    [Animates.translate]: config.anims[Animates.translate] || [],
                    [Animates.scale]: config.anims[Animates.scale] || [],
                    [Animates.rotate]: config.anims[Animates.rotate] || 0,
                    [Animates.opacity] :config.anims[Animates.opacity] || 1,
                    [Animates.filter] :config.anims[Animates.filter] || null,
                }
            }
            config.anims[Animates.backgroundColor] && (conf.anims[Animates.backgroundColor] = config.anims[Animates.backgroundColor]);
            config.anims[Animates.txtColor] && (conf.anims[Animates.txtColor] = config.anims[Animates.txtColor]);
            return conf;
        },
        onended: (handler) => {
            onEnded = handler;
            return this;
        },
        set:(fromState)=>{
            if(fromState){
                target.style.cssText += `
                transform: translate(${fromState.anims[Animates.translate].toString() || '0px,0px'}) scale(${fromState.anims[Animates.scale].toString() || '1,1'}) rotate(${fromState.anims[Animates.rotate] || '0deg'});
                opacity: ${fromState.anims[Animates.opacity]};
                filter: ${fromState.anims[Animates.filter]};
                `;
                fromState.anims[Animates.backgroundColor] && (target.style.cssText += `background-color: ${fromState.anims[Animates.backgroundColor]};`);
                fromState.anims[Animates.txtColor] && (target.style.cssText += `color: ${fromState.anims[Animates.txtColor]};`);
                fromState.anims[Animates.shadow] && (target.style.boxShadow = fromState.anims[Animates.shadow]);
            }
        },
        to:(toState)=>{
            target.style.transition = `all ${toState.time} ${toState.timingFunction}`;
            setTimeout(()=>{
                let anims = toState.anims;
                target.style.cssText += `
                transform: translate(${anims[Animates.translate].toString() || '0px,0px'}) scale(${anims[Animates.scale].toString() || '1,1'}) rotate(${anims[Animates.rotate] || '0deg'});
                opacity: ${anims[Animates.opacity]};
                filter: ${anims[Animates.filter]};
                `;
                anims[Animates.backgroundColor] && (target.style.cssText += `background-color: ${anims[Animates.backgroundColor]};`);
                anims[Animates.txtColor] && (target.style.cssText += `color: ${anims[Animates.txtColor]};`);
                anims[Animates.shadow] && (target.style.boxShadow = anims[Animates.shadow]);
            },10);
        },
        play:(toState,fromState) => {
            target.style.transition = null;
            if(fromState){
                target.style.cssText += `
                transform: translate(${fromState.anims[Animates.translate].toString() || '0px,0px'}) scale(${fromState.anims[Animates.scale].toString() || '1,1'}) rotate(${fromState.anims[Animates.rotate] || '0deg'});
                opacity: ${fromState.anims[Animates.opacity]};
                filter: ${fromState.anims[Animates.filter]};
                `;
                fromState.anims[Animates.backgroundColor] && (target.style.cssText += `background-color: ${fromState.anims[Animates.backgroundColor]};`);
                fromState.anims[Animates.txtColor] && (fromState.anims[Animates.txtColor] = fromState.anims[Animates.txtColor]);
            }
            let onend = () => {
                target.removeEventListener('transitionend',onend);
                onEnded.call(target);
            }
            target.addEventListener('transitionend',onend);
            setTimeout(()=>{
                target.style.transition = `all ${fromState.time || toState.time} ${fromState.timingFunction || toState.timingFunction}`;
                setTimeout(()=>{
                    let anims = toState.anims;
                    target.style.cssText += `
                    transform: translate(${anims[Animates.translate].toString() || '0px,0px'}) scale(${anims[Animates.scale].toString() || '1,1'}) rotate(${anims[Animates.rotate] || '0deg'});
                    opacity: ${anims[Animates.opacity]};
                    filter: ${anims[Animates.filter]};
                    `;
                    anims[Animates.backgroundColor] && (target.style.cssText += `background-color: ${anims[Animates.backgroundColor]};`);
                    anims[Animates.txtColor] && (target.style.cssText += `color: ${anims[Animates.txtColor]};`);
                },10)
            },10);
        },
    }
}