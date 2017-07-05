// @flow

import type {AnnotatedBitmap, Bitmap, BitmapAnnotation} from "../Bitmap";
import type {Byte} from "../SimpleTypes";

const LinebreakAnnotation = require("../rendering/LinebreakAnnotation.js");

class PagingAnimation {
    _source: AnnotatedBitmap;
    _frameWidth: number;
    _ticksPerPage : number;
    _currentTick : number;
    _pages: Array<Bitmap>;

    constructor(ticksPerPage: number) {
        this._ticksPerPage = ticksPerPage;
        this._pages = [];
        this.reset();
    }

    setSource(source : AnnotatedBitmap, frameWidth: number) : void {
        this._source = source;
        this._frameWidth = frameWidth;
        this._currentTick = 0;
        let linebreakAnnotations : Array<LinebreakAnnotation> = ((
            source.annotations.filter((annotation : BitmapAnnotation) =>
                annotation instanceof LinebreakAnnotation
            ) : Array<any>) : Array<LinebreakAnnotation>);
        let annotationsReversed = linebreakAnnotations.reverse();
        let rest = this._source.length;
        let cursor = 0;
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
            rest = this._source.length - cursor;
        }
    }
    tick() : void {
        this._currentTick += 1;
    }

    get currentPageIdx() : number {
        return Math.min(Math.floor(this._currentTick / this._ticksPerPage), this._pages.length -1);
    }

    get ticksPerMessage() : number {
        return this._pages.length * this._ticksPerPage
    }

    reset() : void {
        this._currentTick = 0;
    };
    getTranslated(idx : number) : Byte {
        return this._pages[this.currentPageIdx][idx] || 0;
    }
    isAnimationComplete() : boolean {
        return this._currentTick >= this.ticksPerMessage;
    }
    getAnimationRemaining() : number {
        return this.ticksPerMessage - this._currentTick;
    }

}

module.exports = PagingAnimation;