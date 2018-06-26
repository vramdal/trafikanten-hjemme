// @flow

import type {Byte} from "../types/SimpleTypes";
import type {Animation} from "./Animation";
import type {AnnotatedBitmap} from "../bitmap/Bitmap";

const TextLayout = require("./TextLayout.js");

class PagingAnimation implements Animation {

    _textLayout : TextLayout;
    _ticksPerPage : number;
    _currentTick : number;
    _lines : number;
    _frameWidth : number;


    constructor(ticksPerPage: number = 50) {
        this._ticksPerPage = ticksPerPage;
    }

    //noinspection JSUnusedGlobalSymbols
    reset() : void {
        this._currentTick = 0;
    }

    tick() : void {
        this._currentTick += 1;
    }

    get ticksPerMessage() : number {
        return this._textLayout.pages.length * this._ticksPerPage
    }

    setSource(source : AnnotatedBitmap, frameWidth: number, lines : number = 1) : void {
        this._currentTick = 0;
        this._lines = lines;
        this._frameWidth = frameWidth;
        this._textLayout = new TextLayout(source, frameWidth);
    }

    get currentPageIdx() : number {
        return Math.min(
            Math.floor(this._currentTick / this._ticksPerPage) * this._lines,
            this._textLayout.pages.length - this._textLayout.pages.length % this._lines
        );
    }

    getTranslated(idx : number) : Byte {
        let pageDelta = Math.floor(idx / this._frameWidth);
        if (pageDelta + this.currentPageIdx > this._lines) {
            return 0;
        }
        let x = idx % this._frameWidth;
        return this._textLayout.pages[this.currentPageIdx + pageDelta]
            && this._textLayout.pages[this.currentPageIdx + pageDelta][x] || 0;
    }

    getTranslatedOnLine(x : number, line : number) : Byte {
        return this._textLayout.pages[line]
            && this._textLayout.pages[line][x] || 0;
    }


    isAnimationComplete() : boolean {
        return this._currentTick >= this.ticksPerMessage;
    }
    getAnimationRemaining() : number {
        return this.ticksPerMessage - this._currentTick;
    }

}

module.exports = PagingAnimation;