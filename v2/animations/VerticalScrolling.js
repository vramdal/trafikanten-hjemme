// @flow

import type {Animation} from "./Animation";
import type {Byte} from "../SimpleTypes";
import type {AnnotatedBitmap} from "../Bitmap";

const Paging = require("./Paging.js");

class VerticalScrollingAnimation extends Paging implements Animation {
    _frameWidth : number;
    _waitTicksOnLine : number;

    constructor() {
        super(10 + 8);
        this._waitTicksOnLine = 10;
    }

    setSource(source : AnnotatedBitmap, frameWidth: number, lines : number = 1) : void {
        super.setSource(source, frameWidth, lines);
    }

    getTranslated(idx : number) : Byte {
        let rowsVisible = Math.min(this._currentTick % this._ticksPerPage, 8); // Incorrect for second line
        let x = idx % this._frameWidth;
        let line = Math.floor(idx / this._frameWidth);
        let byte = super.getTranslatedOnLine(x, line);
        // MSB = topmost bit
        let previousLineByte = super.getTranslatedOnLine(x, line - 1);
        switch (rowsVisible) {
            case 0 : return 0;
            default : return (byte >> 8 - rowsVisible | previousLineByte << rowsVisible) & 0xFF;
        }
    };
}

module.exports = VerticalScrollingAnimation;