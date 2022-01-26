'use strict';

export class MediaPlayer {
    audio = null;
    context = null;
    source = null;
    constructor(obj){
        this.audio = new Audio();
        const AudioContext = window.AudioContext || window.webkitAudioContext || window.mozAudioContext || window.msAudioContext;
        this.context = new AudioContext();
        this.source = this.context.createMediaElementSource(this.audio);
        this.audio.src = obj.src;
        this.audio.loop = obj.loop || 'false';
        Object.defineProperty(this,'currentTime',{
            get: () => {
                return this.audio.currentTime;
            },
            set: (val) => {
                this.audio.currentTime = val;
            }
        });
        for (const id in obj.events) {
            if (Object.hasOwnProperty.call(obj.events, id)) {
                const handler = obj.events[id];
                this.audio.addEventListener(id,handler);
            }
        }

    }
    play(){
        this.audio.play();
    }
    pause(){
        this.audio.pause();
    }
    seekTo(time){
        this.audio.currentTime = time;
    }
}