// @flow

import type {Bitmap} from "./BitmapWithControlCharacters";
class Frame {
    _width : number;
    _scrollOffset: number;
    _source: Bitmap;
    _bitmap: Bitmap;

    constructor(width : number, source : Bitmap) {
        this._width = width;
        this._source = source;
        this._scrollOffset = 0;
        this._updateView();
    }

    scroll(delta : number) {
        this._scrollOffset += delta;
        this._updateView();
    }

    _updateView() {
        let start = this._source.byteOffset - this._scrollOffset;
        // TODO: What to do when scrolling out of buffer;
        this._bitmap = new Uint8Array(this._source.buffer, start, this._width);
    }

    get bitmap(): Bitmap {
        return this._bitmap;
    }
}

module.exports = Frame;