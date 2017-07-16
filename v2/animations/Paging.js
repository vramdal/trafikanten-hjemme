// @flow

import type {Byte} from "../SimpleTypes";
import type {Animation} from "./Animation";
import type {AnnotatedBitmap} from "../Bitmap";

const MultilineHandler = require("./MultilineHandler.js");

class PagingAnimation implements Animation {

    _multilineHandler : MultilineHandler;
    _ticksPerPage : number;
    _currentTick : number;


    constructor(ticksPerPage: number) {
        this._ticksPerPage = ticksPerPage;
        this._multilineHandler = new MultilineHandler();
    }

    //noinspection JSUnusedGlobalSymbols
    reset() : void {
        this._multilineHandler.reset();
        this._currentTick = 0;
    }

    tick() : void {
        this._currentTick += 1;
    }

    get ticksPerMessage() : number {
        return this._multilineHandler.pages.length * this._ticksPerPage
    }

    setSource(source : AnnotatedBitmap, frameWidth: number, lines : number = 1) : void {
        this._currentTick = 0;
        this._multilineHandler.setSource(source, frameWidth, lines);
    }

    get currentPageIdx() : number {
        return Math.min(
            Math.floor(this._currentTick / this._ticksPerPage) * this._multilineHandler.lines,
            this._multilineHandler.pages.length - this._multilineHandler.pages.length % this._multilineHandler.lines
        );
    }

    getTranslated(idx : number) : Byte {
        let pageDelta = Math.floor(idx / this._multilineHandler.frameWidth);
        if (pageDelta + this.currentPageIdx > this._multilineHandler.lines) {
            return 0;
        }
        let x = idx % this._multilineHandler.frameWidth;
        return this._multilineHandler.pages[this.currentPageIdx + pageDelta]
            && this._multilineHandler.pages[this.currentPageIdx + pageDelta][x] || 0;
    }

    getTranslatedOnLine(x : number, line : number) : Byte {
        return this._multilineHandler.pages[line]
            && this._multilineHandler.pages[line][x] || 0;
    }


    isAnimationComplete() : boolean {
        return this._currentTick >= this.ticksPerMessage;
    }
    getAnimationRemaining() : number {
        return this.ticksPerMessage - this._currentTick;
    }

}

module.exports = PagingAnimation;