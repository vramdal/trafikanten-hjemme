// @flow

import type {BitmapAnnotation} from "../Bitmap";
class LinebreakAnnotation implements BitmapAnnotation {

    start : number;
    end : number;

    constructor(start: number, end: number) {
        this.start = start;
        this.end = end;
    }
}

module.exports = LinebreakAnnotation;