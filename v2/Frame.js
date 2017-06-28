// @flow

import type {Bitmap} from "./BitmapWithControlCharacters";

/**
 * When the returned number is 0, the scroll has completed a full cycle
 */
export type ScrollPromise = Promise<void>;
export type Layout = Array<Frame>;

class Frame { // TODO: this should really be called ScrollFrame. Make abstract class.
    _width : number;
    _scrollOffset: number;
    _source: Bitmap;
    _bitmap: Bitmap;
    _x: number;

    constructor(x: number, width : number) {
        this._x = x;
        this._width = width;
    }

    setBitmap(source: Bitmap) {
        this._source = source;
        this._scrollOffset = 0;
        let _this = this;
        this._bitmap = new Proxy(new Uint8Array(this._source.buffer, this._source.byteOffset, this._source.length), {
            subarray: function(begin = 0, end = _this._width) {
                let result = new Array(end - begin);
                for (let i = begin; i < end; i++) {
                    result[i] = _this._getAdjustedByScrollOffset(i);
                }
                return result;
            },
            get: function(target, propertyKey) {
                let idx;
                if (typeof propertyKey === "string" && !isNaN(parseInt(propertyKey))) {
                    idx = parseInt(propertyKey, 10);
                } else if (typeof propertyKey === "number") {
                    idx = propertyKey;
                }
                if (idx !== undefined) {
                    return this.getByIdx(idx);
                } else if (propertyKey === "toString") {
                    return () => {
                        let leftPads = Math.min(_this._scrollOffset, 0);
                        let rightPads = Math.max(_this._width, _this._width - _this._source.length);
                        return new Array(leftPads).join(",") + target.join(", ") + new Array(rightPads).join(",");
                    }
                } else if (propertyKey === "length") {
                    return _this.width;
                } else if (this[propertyKey]) {
                    return this[propertyKey];
                } else {
                    return Reflect.get(target, propertyKey, target);
                }
            },
            getByIdx: function(idx) {
                return _this._getAdjustedByScrollOffset(idx);
            }
        });
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
        if (!this._source) {
            throw new Error("No source bitmap set for frame");
        }
        if (this.remainingScrollWidth > 0) {
            this._scrollOffset += delta;
        }
    }

    get scrollWidth() : number {
        return this._width * 2 + this._source.length;
    }

    //noinspection JSUnusedGlobalSymbols
    resetScroll() {
        this._scrollOffset = 0;
    }

    tick() : ScrollPromise {
        return new Promise((resolve, reject) => {
            try {
                this.scroll(-1);
                return resolve();
            } catch (e) {
                return reject(e);
            }
        });
    }

    get remainingScrollWidth() : number { // TODO: Only supports scrolling left for now
        return Math.max(this.scrollWidth - Math.abs(this._scrollOffset), 0);
    }

    get width(): number {
        return this._width;
    }

    get bitmap(): Bitmap {
        return this._bitmap;
    }
}

module.exports = Frame;