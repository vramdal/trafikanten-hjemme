import type {Animation} from "./Animation";
import type {Bitmap} from "../bitmap/Bitmap";
import type {Alignments} from "./Types";
import { Byte } from "../types/SimpleTypes";

// type AlignmentFunc = (frameWidth : number, contentPixelLength : number) => number;

import Alignment from "./Alignment";

//noinspection JSUnusedGlobalSymbols
class NoAnimation implements Animation {
    _source: Bitmap;
    _frameWidth: number;
    _timeoutTicks : number;
    _countdown : number;
    _alignmentOffset: number;
    _alignment: Alignments;

    constructor(timeoutTicks : number, alignment : Alignments) {
        this._timeoutTicks = timeoutTicks;
        this._countdown = timeoutTicks;
        this._alignment = alignment;
    }

    //noinspection JSUnusedGlobalSymbols
    setSource(source : Bitmap, frameWidth: number, lines : number) {
        if (lines > 1) {
            throw new Error(`NoAnimation supports only 1 line, not ${lines}`);
        }
        this._source = source;
        this._frameWidth = frameWidth;
        this._alignmentOffset = Alignment[this._alignment](this._frameWidth, this._source.length);
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
        let offsetTranslated = idx + this._alignmentOffset * -1;
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

export default NoAnimation;
