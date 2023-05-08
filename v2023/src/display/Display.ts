import Playlist from "../rendering/PlaylistDisplay";
import type { Layout } from "../bitmap/Frame";
import type { Bitmap } from "../bitmap/Bitmap";
import type { DisplayInterface } from './DisplayInterface';
// import DisplayEventEmitter from "./DisplayEventEmitter";

import Collage from "../bitmap/Collage";

// import {EventTypeNames} from "../types/SimpleTypes";

class Display implements DisplayInterface {

  _playlist: Playlist | undefined;
  // _eventEmitter: DisplayEventEmitter;
  _buffer: Uint8Array;
  _isPlaying: boolean;

  constructor() {
    this._buffer = new Uint8Array(256);
    // this._eventEmitter = new DisplayEventEmitter();
    // this._eventEmitter.on(EventTypeNames.EVENT_BITMAP_UPDATED, this.onBitmapUpdated.bind(this));
    // this._eventEmitter.on(EventTypeNames.EVENT_BITMAP_CLEAR, this.clear.bind(this));
    this._isPlaying = false;
  }

  /*
      get eventEmitter() : DisplayEventEmitter {
          return this._eventEmitter;
      }
  */

  set playlist(playlist: Playlist) {
    this._playlist = playlist;
  }

  onBitmapUpdated(layout: Layout): void {
    let collage: Collage = new Collage(layout);
    collage.pasteTo(this._buffer);
    this.output();
  }

  clear(): void {
    this._buffer.fill(0);
    this.output();
  }

  output() {
    throw new Error("This should have been overridden by an extending class");
  }

  get buffer(): Bitmap {
    return this._buffer;
  }

  play() {
    if (this._playlist) {
      return this._playlist.play().catch(err => {
        console.error("Display error: ", err)
      });
    } else {
      return Promise.resolve();
    }
  }

  stop() {
    this._isPlaying = false;
    if (this._playlist) {
      this._playlist.stop();
    }
  }

  close() {}


}

// module.exports = Display;

export default Display;
