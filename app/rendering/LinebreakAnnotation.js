// @flow

import type {BitmapAnnotation} from "../bitmap/Bitmap";

type LinebreakType = "Soft" | "Hard";

class LinebreakAnnotation implements BitmapAnnotation {

    start : number;
    end : number;
    type: LinebreakType;

    constructor(start: number, end: number, type : LinebreakType = "Soft") {
        this.start = start;
        this.end = end;
        this.type = type;
    }
}

module.exports = LinebreakAnnotation;