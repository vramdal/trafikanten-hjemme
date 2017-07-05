// @flow

import type {BitmapAnnotation} from "../Bitmap";
import type {Char} from "../SimpleTypes";

class FontCharacterAnnotation implements BitmapAnnotation {
    start : number;
    end : number;
    char : Char | number;
    idx: number;


    constructor(start: number, end: number, char : Char | number, idx : number) {
        this.start = start;
        this.end = end;
        this.char = char;
        this.idx = idx;
    }
}

module.exports = FontCharacterAnnotation;