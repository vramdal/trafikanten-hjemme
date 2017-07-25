// @flow

import type {Animation} from "./Animation";
import type {Byte} from "../SimpleTypes";
import type {AnnotatedBitmap} from "../Bitmap";

const TextLayout = require("./TextLayout.js");

const PADDING_BETWEEN_LINES = 2;
const WAIT_TICKS_ON_LINE = 10;

class VerticalScrollingAnimation implements Animation {
    _frameWidth : number;
    _waitTicksOnLine : number;
    _textLayout : TextLayout;
    _lines : number;
    _currentTick : number;


    constructor() {
        this._waitTicksOnLine = WAIT_TICKS_ON_LINE;
    }

    setSource(source : AnnotatedBitmap, frameWidth: number, lines : number = 1) : void {
        this._textLayout = new TextLayout(source, frameWidth);
        this._frameWidth = frameWidth;
        this._lines = lines;
        this.reset();
    }

    reset() : void {
        this._currentTick = 0;
    }

    tick() : void {
        this._currentTick++;
    }

    getAnimationRemaining(): number {
        return this.numLines * this.ticksPerLine - this._currentTick;
    }

    isAnimationComplete() : boolean {
        return this.getAnimationRemaining() <= 0;
    }

    get height() : number {
        return this.numLines * 10 - PADDING_BETWEEN_LINES;
    }

    //noinspection JSMethodCanBeStatic
    get ticksPerLine() : number {
        return 8 + PADDING_BETWEEN_LINES;
    }

    get numLines(): number {
        return this._textLayout.pages.length;
    }

    getTranslatedOnLine(x : number, line : number = 0) : Byte {
        let byteStack = this._textLayout.pages.getByteStack(x, PADDING_BETWEEN_LINES);
        let str : string = byteStack.toString(2);
        for (let i = 0; i < this.height; i++) {
            str = "0" + str;
        }
        for (let i = 0; i < this.height; i++) {
            str = str + "0";
        }
        str = str.slice(this._currentTick, this._currentTick + this.height);
        //noinspection UnnecessaryLocalVariableJS
        //let lineAdjusted = byteStack >> this.numLines * this.ticksPerLine;
        let start = line * this.ticksPerLine;
        let lineAdjustedStr = str.substring(start, start + 8);
        return parseInt(lineAdjustedStr, 2);
    }

    getTranslated(idx : number) : Byte {
        let line = Math.floor(idx / this._frameWidth);
        let x = idx % this._frameWidth;
        return this.getTranslatedOnLine(x, line);

    };
}

module.exports = VerticalScrollingAnimation;