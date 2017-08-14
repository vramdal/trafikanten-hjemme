// @flow

const LinebreakAnnotation = require("../rendering/LinebreakAnnotation.js");
const FontCharacterAnnotation = require("../rendering/FontCharacterAnnotation.js");

const MultilineBitmap = require("../Bitmap.js").MultilineBitmap;

import type {AnnotatedBitmap, BitmapAnnotation, Bitmap} from "../Bitmap";

import type {Char} from "../SimpleTypes";

class TextLayout {

    _pages: MultilineBitmap;
    _charPages : Array<Char>;
    _overflows: MultilineBitmap;

    constructor(source : AnnotatedBitmap, frameWidth: number) {
        this.reset();
        const hardLinebreakAnnotations = this.extractLinebreakAnnotations(source, "Hard");

        let splitByHardLinebreaks : Array<AnnotatedBitmap> = [];
        let hCursor = 0;
        for (let hardLinebreak of hardLinebreakAnnotations) {
            splitByHardLinebreaks.push(this.extractHardPage(source, hardLinebreak, hCursor));
            hCursor = hardLinebreak.end;
        }
        splitByHardLinebreaks.push(this.extractHardPage(source, null, hCursor));

        for (let hardPage of splitByHardLinebreaks) {

            let softLinebreakAnnotations : Array<LinebreakAnnotation> = this.extractLinebreakAnnotations(hardPage, "Soft");
            let annotationsReversed = softLinebreakAnnotations.slice().reverse();
            let cursor = 0;
            let previousPageStart = 0;
            while (cursor < hardPage.length) {
                let rest = hardPage.length - cursor;
                let canFitRestInOneFrame = rest < frameWidth;
                if (canFitRestInOneFrame) {
                    this._pages.push(hardPage.subarray(cursor));
                    cursor = hardPage.length;
                } else {
                    let linebreakAnnotation = annotationsReversed.find(annotation => annotation.start > cursor && annotation.start < cursor + frameWidth);
                    if (linebreakAnnotation) {
                        this._pages.push(hardPage.subarray(cursor, linebreakAnnotation.start));
                        cursor = linebreakAnnotation.end;
                    } else {
                        this._pages.push(hardPage.subarray(cursor, cursor + frameWidth));
                        let nextBreak = softLinebreakAnnotations.find(annotation => annotation.start > cursor);
                        cursor = nextBreak && nextBreak.end
                            || hardPage.length;
                        this._overflows[this._pages.length - 1] = hardPage.slice(previousPageStart + frameWidth, cursor);
                    }
                }
                let characters : string = (hardPage.annotations
                    .filter(annotation => annotation instanceof FontCharacterAnnotation)
                    .filter(annotation => annotation.start >= previousPageStart && annotation.end < cursor )
                    .map(annotation => ((annotation : any) : FontCharacterAnnotation).char): Array<any>)
                    .join("");
                this._charPages.push(characters);
                previousPageStart = cursor;
            }
        }
    }

    extractHardPage(source : AnnotatedBitmap, _hardLinebreak : ?LinebreakAnnotation, hCursor : number) : AnnotatedBitmap {
        const hardLinebreak = _hardLinebreak;
        let annotations: ?Array<BitmapAnnotation> = source.annotations
                .filter(annotation => hardLinebreak && (
                    annotation.start >= hardLinebreak.start && annotation.end <= hardLinebreak.end
                ) || !hardLinebreak)
                .filter(annotation => !(annotation instanceof LinebreakAnnotation && annotation.type === "Hard"));

        let bytes = (source: Uint8Array).subarray(hCursor, hardLinebreak && hardLinebreak.start || undefined);
        const pageLimitedByHardLineBreak = ((bytes: any): AnnotatedBitmap);
        pageLimitedByHardLineBreak.annotations = annotations || [];
        return pageLimitedByHardLineBreak;
    }

    extractLinebreakAnnotations(source : AnnotatedBitmap, type : ("Soft" | "Hard")) {
        return ((source.annotations
            .filter((annotation: BitmapAnnotation) =>
                annotation instanceof LinebreakAnnotation
            ): Array<any>): Array<LinebreakAnnotation>)
            .filter((annotation: LinebreakAnnotation) => annotation.type === type);
    }

    reset() : void {
        this._pages = new MultilineBitmap();
        this._overflows = new MultilineBitmap();
        this._charPages = [];
    };

    get pages(): MultilineBitmap {
        return this._pages;
    }

    //noinspection JSUnusedGlobalSymbols
    get charPages(): Array<Char> {
        return this._charPages;
    }

}

module.exports = TextLayout;