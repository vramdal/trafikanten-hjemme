// @flow

const Playlist = require("./Playlist.js");

const DisplayEventEmitter = require("./DisplayEventEmitter.js");
import type {Layout} from "./Frame";
const Collage = require("./Collage.js");
const BitmapUtil = require("./BitmapUtil.js");
const EventTypeNames = require("./SimpleTypes.js").EventTypeNames;

class Display {

    _playlist: ?Playlist;
    _eventEmitter: DisplayEventEmitter;
    _buffer: Uint8Array;

    constructor() {
        this._buffer = new Uint8Array(256);
        this._eventEmitter = new DisplayEventEmitter();
        this._eventEmitter.on(EventTypeNames.EVENT_BITMAP_UPDATED, this.onBitmapUpdated.bind(this));
    }

    get eventEmitter() : DisplayEventEmitter {
        return this._eventEmitter;
    }

    set playlist(playlist : Playlist) {
        this._playlist = playlist;
    }

    onBitmapUpdated(layout : Layout) : void {
        let collage : Collage = new Collage(layout);
        collage.pasteTo(this._buffer);
        BitmapUtil.bitmapTo8Lines(this._buffer.slice(0, 128));
        BitmapUtil.bitmapTo8Lines(this._buffer.slice(128));
    }



    play() {
        if (this._playlist) {
            this._playlist.play().then(() => {
                this.play();
            }).catch(err => {
                console.error("Display error: ", err)
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