// @flow

const LinebreakAnnotation = require("../rendering/LinebreakAnnotation.js");
const FontCharacterAnnotation = require("../rendering/FontCharacterAnnotation.js");

import type {AnnotatedBitmap, Bitmap, BitmapAnnotation} from "../Bitmap";
import type {Char} from "../SimpleTypes";

class TextLayout {

    _pages: Array<Bitmap>;
    _charPages : Array<Char>;

    constructor(source : AnnotatedBitmap, frameWidth: number) {
        this.reset();
        let linebreakAnnotations : Array<LinebreakAnnotation> = ((
            source.annotations.filter((annotation : BitmapAnnotation) =>
                annotation instanceof LinebreakAnnotation
            ) : Array<any>) : Array<LinebreakAnnotation>);
        let annotationsReversed = linebreakAnnotations.reverse();
        let cursor = 0;
        let previousPageStart = 0;
        while (cursor < source.length) {
            let rest = source.length - cursor;
            let canFitRestInOneFrame = rest < frameWidth;
            if (canFitRestInOneFrame) {
                this._pages.push(source.subarray(cursor));
                cursor = source.length;
            } else {
                let linebreakAnnotation = annotationsReversed.find(annotation => annotation.start > cursor && annotation.start < cursor + frameWidth);
                if (linebreakAnnotation) {
                    this._pages.push(source.subarray(cursor, linebreakAnnotation.start));
                    cursor = linebreakAnnotation.end;
                } else {
                    this._pages.push(source.subarray(cursor, cursor + frameWidth));
                    let nextBreak = linebreakAnnotations.find(annotation => annotation.start > cursor);
                    cursor = nextBreak && nextBreak.end || source.length;
                }
            }
            let characters : string = (source.annotations
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

    get pages(): Array<Bitmap> {
        return this._pages;
    }

    //noinspection JSUnusedGlobalSymbols
    get charPages(): Array<Char> {
        return this._charPages;
    }

}

module.exports = TextLayout;