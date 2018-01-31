// @flow

import type {BytePosition} from "./BytePosition.js";
import type {Wedge} from "./BytePosition";

class PositionTranslator {

    _canvasWidth : number;
    _canvasHeight : number;
    _horizontalWedges : Array<Wedge>;
    translate : (x : number, y : number) => BytePosition;


    constructor(canvasWidth: number, canvasHeight: number, wedges : Array<Wedge> = []) {
        this._canvasWidth = canvasWidth;
        this._canvasHeight = canvasHeight;
        this.translate = this._translate.bind(this);
        this._horizontalWedges = wedges.filter((wedge : Wedge) => wedge[0] === 'Horizontal').sort((wedgeA : Wedge, wedgeB : Wedge) => wedgeA[1] - wedgeB[1]);
    }

    _translate(x : number, y : number) : BytePosition {
        if (x >= this._canvasWidth) {
            throw new Error(`x ${x} is too wide for width ${this._canvasWidth}`);
        } else if (y >= this._canvasHeight) {
            throw new Error(`y ${y} is too high for height ${this._canvasHeight}`);
        }
        if (this._horizontalWedges.some((wedge : Wedge) => wedge[1] <= y && wedge[1] + wedge[2] > y)) {
            return undefined;
        }
        let wedgesWidth = this._horizontalWedges
            .filter((wedge : Wedge) => wedge[1] <= y)
            .reduce((sum : number, wedge : Wedge) => wedge[2] + sum, 0);
        let yWithoutWedges = y - wedgesWidth;
        if (yWithoutWedges > 7) {
            return [x + this._canvasWidth, yWithoutWedges % 8];
        } else {
            return [x, yWithoutWedges];
        }
    }
}

module.exports = PositionTranslator;