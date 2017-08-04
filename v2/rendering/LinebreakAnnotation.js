// @flow

import type {BitmapAnnotation} from "../Bitmap";

type LinebreakType = "Soft" | "Hard";

class LinebreakAnnotation implements BitmapAnnotation {

    start : number;
    end : number;
    type: LinebreakType;

    constructor(start: number, end: number, type : LinebreakType) {
        this.start = start;
        this.end = end;
        this.type = type;
    }
}

module.exports = LinebreakAnnotation;