// @flow

import type {Rectangle} from "../Rectangle";
const ArrayUtil = require("../ArrayUtil.js");

const STRIP_HEIGHT : number = 8;

class MonoBitmap {
    _width: number;
    _height: number;
    _buffer: Uint8ClampedArray;
    _deadAreas : Array<Rectangle>;
    _sumDeadHorizontal : number;
    isFullWidth : (_ : Rectangle) => boolean;
    _numStrips : number;

    constructor(width: number, height: number, deadAreas : Array<Rectangle> = []) {
        this._width = width;
        this._height = height;
        this._deadAreas = deadAreas;
        this.isFullWidth = this.isFullWidth.bind(this);
        this._sumDeadHorizontal = deadAreas.filter(this.isFullWidth).reduce(ArrayUtil.sumProperty(rectangle => rectangle.height));
        this._buffer = new Uint8ClampedArray(width * (height - this._sumDeadHorizontal) / 8);
        this._numStrips = Math.ceil(this._height / STRIP_HEIGHT);
        let stripStartYs = [];
        for (let i = 0; i < this._numStrips; i++) {
            stripStartYs.push(i);
        }
        stripStartYs.forEach((startY : number, index : number) => {

        });
    }

    isFullWidth(rectangle : Rectangle) {
        return rectangle.x === 0 && rectangle.width === this._width;
    }

    isOverlappedBy(rectangle1: Rectangle, rectangle2: Rectangle) {
        return rectangle1.x >= rectangle2.x && rectangle1.x <= rectangle2.x + rectangle2.width &&
            rectangle1.y >= rectangle2.y && rectangle1.y <= rectangle2.y + rectangle2.height;
    }

    pasteSimple(source : MonoBitmap, x : number, y : number) {
        //let crossesDeadHorizontal = this._deadAreas.filter(this.isFullWidth).some(deadHorizontalArea => this.isOverlappedBy(source._getRectangle(), deadHorizontalArea));
        //if (!crossesDeadHorizontal)
        if (isStripAligned) {

        }
    }

    sumArrayPropertyReducer<T>(extractor: (obj : T) => number) {
        return (currentSum : number, currentElement : T, ) => extractor(currentElement) + currentSum;
    }

    get width(): number {
        return this._width;
    }

    get height(): number {
        return this._height;
    }

    _getRectangle() : Rectangle {
        return {x: 0, y: 0, width: this._width, height: this._height};
    }
}

module.exports = MonoBitmap;