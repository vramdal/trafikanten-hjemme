// @flow

import type {BytePosition} from "./BytePosition.js";

class PositionTranslator {

    _targetWidth : number;
    _targetHeight : number;
    translate : (x : number, y : number) => BytePosition;


    constructor(targetWidth: number, targetHeight: number) {
        this._targetWidth = targetWidth;
        this._targetHeight = targetHeight;
        this.translate = this._translate.bind(this);
    }

    _translate(x : number, y : number) : BytePosition {
        if (x >= this._targetWidth) {
            throw new Error(`x ${x} is too wide for width ${this._targetWidth}`);
        } else if (y >= this._targetHeight) {
            throw new Error(`y ${y} is too high for height ${this._targetHeight}`);
        }
        if (y > 7) {
            return [x + this._targetWidth, y % 8];
        } else {
            return [x, y];
        }
    }
}

module.exports = PositionTranslator;