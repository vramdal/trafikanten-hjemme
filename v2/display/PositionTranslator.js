// @flow

import type {Rectangle} from "../Rectangle";
import type {Bitmap} from "../Bitmap";

class PositionTranslator {

    _canvasWidth : number;
    _canvasHeight : number;
    _deadZones : Array<Rectangle>;
    translate : (bitmap : Bitmap, rectangle : Rectangle) => {bitmap : Bitmap, rectangle : Rectangle};


    constructor(canvasWidth: number, canvasHeight: number, deadZones : Array<Rectangle> = []) {
        this._canvasWidth = canvasWidth;
        this._canvasHeight = canvasHeight;
        this.translate = this._translate.bind(this);
        this._deadZones = deadZones.sort((deadZoneA : Rectangle, deadZoneB : Rectangle) => deadZoneA.x - deadZoneB.x);
    }

    _translate(bitmap : Bitmap, rectangle : Rectangle) : {bitmap : Bitmap, rectangle : Rectangle} {
        
/*
        if (x >= this._canvasWidth) {
            throw new Error(`x ${x} is too wide for width ${this._canvasWidth}`);
        } else if (y >= this._canvasHeight) {
            throw new Error(`y ${y} is too high for height ${this._canvasHeight}`);
        }
        if (this._deadZones.some((deadZone : Rectangle) => this.isInRectangle(deadZone, x, y))) {
            return null;
        }
        return {x: x + (y > 7 ? this._canvasWidth : 0), y: 0};
*/
    }

    isInRectangle(rectangle : Rectangle, x : number, y : number) : boolean {
        return x >= rectangle.x && x < rectangle.x + rectangle.width && y >= rectangle.y && y < rectangle.y + rectangle.height;
    }
}

module.exports = PositionTranslator;