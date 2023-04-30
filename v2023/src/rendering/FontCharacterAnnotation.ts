import type {BitmapAnnotation} from "../bitmap/Bitmap";
import type {Char} from "../types/SimpleTypes";

export class FontCharacterAnnotation implements BitmapAnnotation {
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
