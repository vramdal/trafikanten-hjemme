import type { Animation } from "./Animation";
import type { Bitmap } from "../bitmap/Bitmap";
import type { Byte } from "../types/SimpleTypes";

class Scrolling implements Animation {

  _frameWidth: number;
  _scrollOffset: number;
  _source: Bitmap;

  constructor() {
  }

  //noinspection JSUnusedGlobalSymbols
  setSource(source: Bitmap, frameWidth: number, lines: number): void {
    if (lines > 1) {
      throw new Error(`Scrolling supports only 1 line, not ${lines}`);
    }
    this._frameWidth = frameWidth;
    this._source = source;
    this._scrollOffset = 0;
  }

  //noinspection JSUnusedGlobalSymbols
  tick(): void {
    this.scroll(-1);
  }

  scroll(delta: number): void {
    if (this.remainingScrollWidth > 0) {
      this._scrollOffset += delta;
    }
  }

  //noinspection JSUnusedGlobalSymbols
  reset(): void {
    this._scrollOffset = 0;
  }


  getTranslated(idx: number): Byte {
    let contentStart = this._frameWidth;
    let contentEnd = contentStart + this._source.length;
    let end = contentEnd + this._frameWidth;

    let offsetIdx = idx + this._scrollOffset * -1;

    if (offsetIdx < contentStart) {
      return 0;
    } else if (offsetIdx < contentEnd) {
      return this._source[offsetIdx - contentStart];
    } else if (offsetIdx < end) {
      return 0;
    } else {
      throw new Error("Out of range: " + idx);
    }
  }

  get remainingScrollWidth(): number { // TODO: Only supports scrolling left for now
    return Math.max(this.scrollWidth - Math.abs(this._scrollOffset), 0);
  }

  //noinspection JSUnusedGlobalSymbols
  isAnimationComplete(): boolean {
    return this.remainingScrollWidth === 0;
  }

  //noinspection JSUnusedGlobalSymbols
  getAnimationRemaining(): number {
    return this.remainingScrollWidth / this.scrollWidth;
  }

  get scrollWidth(): number {
    return this._frameWidth + this._source.length
  }

  getTranslatedOnLine(x: number, line: number): Byte {
    throw new Error("Ikke implementert")
  }
}

module.exports = Scrolling;
