import Playlist from "./rendering/PlaylistDisplay";
// const DisplayEventEmitter = require("./DisplayEventEmitter.js");
import type {Bitmap} from "./bitmap/Bitmap";
import type {DisplayInterface} from './display/DisplayInterface';
const Collage = require("../bitmap/Collage.js");
const EventTypeNames = require("../types/SimpleTypes.js").EventTypeNames;

class Display implements DisplayInterface {

  _playlist?: Playlist;
  _buffer: Uint8Array;
  _isPlaying : boolean;

  constructor() {
    this._buffer = new Uint8Array(256);
    this._isPlaying = false;
  }

  set playlist(playlist : Playlist) {
    this._playlist = playlist;
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
