// @flow

import type {Animation} from "./Animation";
import type {Bitmap} from "../Bitmap";

//noinspection JSUnusedGlobalSymbols
const alignments : Array<(frameWidth : number, contentPixelLength : number) => number> = [
    function alignLeft() {
        return 0;
    },
    function alignCenter(frameWidth : number, contentPixelLength: number) {
        return Math.floor((contentPixelLength - frameWidth) / 2);
    },
    function alignRight(frameWidth : number, contentPixelLength: number) {
        return contentPixelLength - frameWidth;
    }
];

class NoAnimation implements Animation {
    _source: Bitmap;
    _frameWidth: number;
    _timeoutTicks : number;
    _countdown : number;
    _alignmentOffset: number;
    _alignmentId: number;

    constructor(timeoutTicks : number, alignmentId : number) {
        this._timeoutTicks = timeoutTicks;
        this._countdown = timeoutTicks;
        this._alignmentId = (alignmentId !== undefined ? alignmentId : 0);
    }

    //noinspection JSUnusedGlobalSymbols
    setSource(source : Bitmap, frameWidth: number, lines : number) {
        if (lines > 1) {
            throw new Error(`NoAnimation supports only 1 line, not ${lines}`);
        }
        this._source = source;
        this._frameWidth = frameWidth;
        this._alignmentOffset = alignments[this._alignmentId](this._frameWidth, this._source.length);
        this.reset();
    }

    //noinspection JSUnusedGlobalSymbols
    tick() {
        this._countdown--;
    }
    //noinspection JSUnusedGlobalSymbols
    reset() {
        this._countdown = this._timeoutTicks;
    }
    //noinspection JSUnusedGlobalSymbols
    getTranslated(idx : number) {
        let offsetTranslated = idx + this._alignmentOffset;
        if (offsetTranslated < 0) {
            return 0;
        } else if (offsetTranslated >= this._source.length) {
            return 0;
        } else {
            return this._source[offsetTranslated];
        }
    };
    //noinspection JSUnusedGlobalSymbols
    isAnimationComplete() : boolean {
        return this._countdown <= 0;
    }
    //noinspection JSUnusedGlobalSymbols
    getAnimationRemaining() : number {
        return this._countdown;
    }
}
module.exports = NoAnimation;