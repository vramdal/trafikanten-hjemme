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
        this._bitmap = new Proxy(new Uint8Array(this._source.buffer, this._source.byteOffset, this._source.length), {
            get: function(target, propertyKey) {
                let idx;
                if (typeof propertyKey === "string" && !isNaN(parseInt(propertyKey))) {
                    idx = parseInt(propertyKey, 10);
                } else if (typeof propertyKey === "number") {
                    idx = propertyKey;
                }
                if (idx !== undefined) {
                    return this.getByIdx(idx);
                } else {
                    return Reflect.get(target, propertyKey, target);
                }
            },
            getByIdx: function(idx) {
                return _this._getAdjustedByScrollOffset(idx);
            }
        });
        let _this = this;
    }

    _getAdjustedByScrollOffset(idx : number) {
        let max = this._width;
        let offsetIdx = idx - this._scrollOffset;
        if (idx < 0) {
            throw new RangeError("Out of range: " + idx);
        } else if (idx > max) {
            throw new RangeError(`Out of range: ${idx}, max is ${max}`);
        } else if (offsetIdx < 0) {
            return 0;
        } else if (offsetIdx > this._width) {
            return 0;
        } else {
            return this._source[offsetIdx];
        }
    }

    scroll(delta : number) {
        this._scrollOffset += delta;
    }

    get bitmap(): Bitmap {
        return this._bitmap;
    }
}

module.exports = Frame;