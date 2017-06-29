// @flow

import type {Animation} from "./Animation";
import type {Bitmap} from "../BitmapWithControlCharacters";
import type {Byte} from "../SimpleTypes";

class Scrolling implements Animation {

    _frameWidth: number;
    _scrollOffset : number;
    _source: Bitmap;

    constructor() {
    }

    //noinspection JSUnusedGlobalSymbols
    setSource(source : Bitmap, frameWidth: number) : void {
        this._frameWidth = frameWidth;
        this._source = source;
        this._scrollOffset = 0;
    }

    //noinspection JSUnusedGlobalSymbols
    tick() : void {
        this.scroll(-1);
    }

    scroll(delta : number) : void {
        if (this.remainingScrollWidth > 0) {
            this._scrollOffset += delta;
        }
    }

    //noinspection JSUnusedGlobalSymbols
    reset() : void {
        this._scrollOffset = 0;
    }


    getTranslated(idx : number) : Byte {
        let contentStart = this._frameWidth;
        let contentEnd = contentStart + this._source.length;
        let end = contentEnd + this._frameWidth;

        let offsetIdx = idx + this._scrollOffset * -1;

        if (offsetIdx < contentStart) {
            return 0;
        } else if (offsetIdx < contentEnd) {
            return this._source[offsetIdx - contentStart];
        } else if (offsetIdx < end) {
            return 0;
        } else {
            throw new Error("Out of range: " + idx);
        }
    }

    get remainingScrollWidth() : number { // TODO: Only supports scrolling left for now
        return Math.max(this.scrollWidth - Math.abs(this._scrollOffset), 0);
    }

    //noinspection JSUnusedGlobalSymbols
    get animationComplete() : boolean {
        return this.remainingScrollWidth === 0;
    }

    //noinspection JSUnusedGlobalSymbols
    get animationRemaining() : number {
        return this.remainingScrollWidth / this.scrollWidth;
    }

    get scrollWidth() : number {
        return this._frameWidth + this._source.length
    }
}

module.exports = Scrolling;