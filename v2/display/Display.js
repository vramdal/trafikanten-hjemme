// @flow

const Playlist = require("../PlaylistDisplay.js");

const DisplayEventEmitter = require("../DisplayEventEmitter.js");
import type {Layout} from "../Frame";
import type {Bitmap} from "../Bitmap";
import type {DisplayInterface} from './DisplayInterface';
const Collage = require("../Collage.js");
const EventTypeNames = require("../SimpleTypes.js").EventTypeNames;

class Display implements DisplayInterface {

    _playlist: ?Playlist;
    _eventEmitter: DisplayEventEmitter;
    _buffer: Uint8Array;
    _isPlaying : boolean;

    constructor() {
        this._buffer = new Uint8Array(256);
        this._eventEmitter = new DisplayEventEmitter();
        this._eventEmitter.on(EventTypeNames.EVENT_BITMAP_UPDATED, this.onBitmapUpdated.bind(this));
        this._eventEmitter.on(EventTypeNames.EVENT_BITMAP_CLEAR, this.clear.bind(this));
        this._isPlaying = false;
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
        this.output();
    }

    clear() : void {
        this._buffer.fill(0);
        this.output();
    }

    output() {
        throw new Error("This should have been overridden by an extending class");
    }

    get buffer() : Bitmap {
        return this._buffer;
    }

    play() {
        if (this._playlist) {
            this._playlist.play().then(() => {
                this._isPlaying = true;
                console.log("PlaylistDisplay exhausted");
                this._eventEmitter.emit(EventTypeNames.EVENT_PLAYLIST_EXHAUSTED);
                this.play();
            }).catch(err => {
                console.error("Display error: ", err)
            });
        } else {
            setTimeout(this.play.bind(this), 1000);
        }
    }

    stop() {
        this._isPlaying = false;
        if (this._playlist) {
            this._playlist.stop();
        }
    }


}

module.exports = Display;