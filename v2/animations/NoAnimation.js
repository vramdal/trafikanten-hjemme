// @flow

import type {Animation} from "./Animation";
import type {Bitmap} from "../Bitmap";

class NoAnimation implements Animation {
    _source: Bitmap;
    _frameWidth: number;
    _timeoutTicks : number;
    _countdown : number;

    constructor(timeoutTicks : number) {
        this._timeoutTicks = timeoutTicks;
        this._countdown = timeoutTicks;
    }

    //noinspection JSUnusedGlobalSymbols
    setSource(source : Bitmap, frameWidth: number, lines : number) {
        if (lines > 1) {
            throw new Error(`NoAnimation supports only 1 line, not ${lines}`);
        }
        this._source = source;
        this._frameWidth = frameWidth;
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
        return this._source[idx];
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