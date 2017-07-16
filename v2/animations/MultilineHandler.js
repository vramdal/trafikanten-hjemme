// @flow

const LinebreakAnnotation = require("../rendering/LinebreakAnnotation.js");
const FontCharacterAnnotation = require("../rendering/FontCharacterAnnotation.js");

import type {AnnotatedBitmap, Bitmap, BitmapAnnotation} from "../Bitmap";
import type {Char} from "../SimpleTypes";

class MultilineHandler {

    _source: AnnotatedBitmap;
    _frameWidth: number;
    _lines : number;
    _pages: Array<Bitmap>;
    _charPages : Array<Char>;

    constructor() {
        this.reset();
    }

    setSource(source : AnnotatedBitmap, frameWidth: number, lines : number = 1) : void {
        this.reset();
        this._source = source;
        this._frameWidth = frameWidth;
        this._lines = lines;
        let linebreakAnnotations : Array<LinebreakAnnotation> = ((
            source.annotations.filter((annotation : BitmapAnnotation) =>
                annotation instanceof LinebreakAnnotation
            ) : Array<any>) : Array<LinebreakAnnotation>);
        let annotationsReversed = linebreakAnnotations.reverse();
        let cursor = 0;
        let previousPageStart = 0;
        while (cursor < this._source.length) {
            let rest = this._source.length - cursor;
            let canFitRestInOneFrame = rest < frameWidth;
            if (canFitRestInOneFrame) {
                this._pages.push(this._source.subarray(cursor));
                cursor = this._source.length;
            } else {
                let linebreakAnnotation = annotationsReversed.find(annotation => annotation.start > cursor && annotation.start < cursor + frameWidth);
                if (linebreakAnnotation) {
                    this._pages.push(this._source.subarray(cursor, linebreakAnnotation.start));
                    cursor = linebreakAnnotation.end;
                } else {
                    this._pages.push(this._source.subarray(cursor, cursor + frameWidth));
                    let nextBreak = linebreakAnnotations.find(annotation => annotation.start > cursor);
                    cursor = nextBreak && nextBreak.end || this._source.length;
                }
            }
            let characters : string = (this._source.annotations
                .filter(annotation => annotation instanceof FontCharacterAnnotation)
                .filter(annotation => annotation.start >= previousPageStart && annotation.end < cursor )
                .map(annotation => ((annotation : any) : FontCharacterAnnotation).char): Array<any>)
                .join("");
            this._charPages.push(characters);
            previousPageStart = cursor;
        }
    }

    reset() : void {
        this._pages = [];
        this._charPages = [];
    };

    get frameWidth(): number {
        return this._frameWidth;
    }

    get pages(): Array<Bitmap> {
        return this._pages;
    }

    //noinspection JSUnusedGlobalSymbols
    get charPages(): Array<Char> {
        return this._charPages;
    }

    get lines(): number {
        return this._lines;
    }

}

module.exports = MultilineHandler;