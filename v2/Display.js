// @flow

const Playlist = require("./Playlist.js");
const Message = require("./Message.js");

const DisplayEventEmitter = require("./DisplayEventEmitter.js");
import type {Layout} from "./Frame";
const Collage = require("./Collage.js");
const BitmapUtil = require("./BitmapUtil.js");
const EventTypeNames = require("./SimpleTypes.js").EventTypeNames;

const messages : Array<Message> = [new Message("Hei på deg!"), new Message("Hello, world!")];

class Display {

    _playlist: Playlist;
    _eventEmitter: DisplayEventEmitter;
    _buffer: Uint8Array;

    constructor() {
        this._buffer = new Uint8Array(20);
        this._eventEmitter = new DisplayEventEmitter();
        this._playlist = new Playlist(this._eventEmitter);
        this._eventEmitter.on(EventTypeNames.EVENT_BITMAP_UPDATED, this.onBitmapUpdated.bind(this));
    }


    set playlist(playlist : Playlist) {
        this._playlist = playlist;
    }

    onBitmapUpdated(layout : Layout) : void {
        let collage : Collage = new Collage(layout);
        collage.pasteTo(this._buffer);
        //BitmapUtil.bitmapTo8Lines(this._buffer);
    }



    play() {
        if (this._playlist) {
            this._playlist.play(messages).then(() => {
                this.play();
            }).catch(err => {
                console.error("Feil: ", err)
            });
        } else {
            setTimeout(this.play.bind(this), 1000);
        }
    }

    stop() {
        if (this._playlist) {
            this._playlist.stop();
        }
    }


}

module.exports = Display;