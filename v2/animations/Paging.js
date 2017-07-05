// @flow

import type {AnnotatedBitmap, Bitmap, BitmapAnnotation} from "../Bitmap";
import type {Byte, Char} from "../SimpleTypes";
const FontCharacterAnnotation = require("../rendering/FontCharacterAnnotation.js");

const LinebreakAnnotation = require("../rendering/LinebreakAnnotation.js");

class PagingAnimation {
    _source: AnnotatedBitmap;
    _frameWidth: number;
    _ticksPerPage : number;
    _currentTick : number;
    _pages: Array<Bitmap>;
    _lines: number;
    _charPages : Array<Char>;

    constructor(ticksPerPage: number) {
        this._ticksPerPage = ticksPerPage;
        this.reset();
    }

    setSource(source : AnnotatedBitmap, frameWidth: number, lines : number = 1) : void {
        this.reset();
        this._source = source;
        this._frameWidth = frameWidth;
        this._lines = lines;
        this._currentTick = 0;
        let linebreakAnnotations : Array<LinebreakAnnotation> = ((
            source.annotations.filter((annotation : BitmapAnnotation) =>
                annotation instanceof LinebreakAnnotation
            ) : Array<any>) : Array<LinebreakAnnotation>);
        let annotationsReversed = linebreakAnnotations.reverse();
        let rest = this._source.length;
        let cursor = 0;
        let previousPageStart = 0;
        while (rest > 0) {
            if (rest < frameWidth) {
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
            //console.log("characterAnnotation.char = ", characterAnnotation && characterAnnotation.char);
            rest = this._source.length - cursor;
            previousPageStart = cursor;
        }
    }
    tick() : void {
        this._currentTick += 1;
    }

    get currentPageIdx() : number {
        return Math.min(
            Math.floor(this._currentTick / this._ticksPerPage) * this._lines,
            this._pages.length - this._pages.length % this._lines
        );
    }

    get ticksPerMessage() : number {
        return this._pages.length * this._ticksPerPage
    }

    reset() : void {
        this._currentTick = 0;
        this._pages = [];
        this._charPages = [];
    };
    getTranslated(idx : number) : Byte {
        let pageDelta = Math.floor(idx / this._frameWidth);
        if (pageDelta + this.currentPageIdx > this._lines) {
            return 0;
        }
        let x = idx % this._frameWidth;
/*
        let characterAnnotation : FontCharacterAnnotation = (this._source.annotations
            .filter(annotation => annotation instanceof FontCharacterAnnotation)
            .find(annotation => annotation.start >= idx && idx < annotation.end ) : any);
        //console.log("characterAnnotation.char = ", characterAnnotation && characterAnnotation.char);
        let char = characterAnnotation && characterAnnotation.char;
*/
        return this._pages[this.currentPageIdx + pageDelta] && this._pages[this.currentPageIdx + pageDelta][x] || 0;
    }
    isAnimationComplete() : boolean {
        return this._currentTick >= this.ticksPerMessage;
    }
    getAnimationRemaining() : number {
        return this.ticksPerMessage - this._currentTick;
    }

}

module.exports = PagingAnimation;