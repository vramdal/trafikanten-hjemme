import type {BitmapAnnotation} from "../bitmap/Bitmap";

export type LinebreakType = "Soft" | "Hard";

export class LinebreakAnnotation implements BitmapAnnotation {

    start : number;
    end : number;
    type: LinebreakType;

    constructor(start: number, end: number, type : LinebreakType = "Soft") {
        this.start = start;
        this.end = end;
        this.type = type;
    }
}

export default LinebreakAnnotation
