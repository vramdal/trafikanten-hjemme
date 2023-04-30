// @flow

import type { Animation } from "./Animation";
import type { Byte } from "../types/SimpleTypes";
import type { AnnotatedBitmap } from "../bitmap/Bitmap";
import type { Alignments } from "./Types";

import { TextLayout } from "./TextLayout";

const PADDING_BETWEEN_LINES = 2;
const WAIT_TICKS_ON_LINE = 10;

export class VerticalScrollingAnimation implements Animation {
  _frameWidth: number;
  _waitTicksOnLine: number;
  _textLayout: TextLayout;
  _lines: number;
  _currentTick: number;
  _totalTicked: number;
  _holdOnLine: number;
  _waitTicksOnLastLine: number;
  _alignment: Alignments;
  _scrollIn: boolean;
  _scrollOut: boolean;


  constructor(waitTicksOnLine: number, waitTicksOnLastLine?: number, alignment?: Alignments, scrollIn: boolean = true, scrollOut: boolean = true) {
    this._waitTicksOnLine = waitTicksOnLine || WAIT_TICKS_ON_LINE;
    this._waitTicksOnLastLine = waitTicksOnLastLine || 0;
    this._alignment = alignment || "left";
    this._scrollIn = scrollIn;
    this._scrollOut = scrollOut;
  }

  setSource(source: AnnotatedBitmap, frameWidth: number, lines: number = 1): void {
    this._textLayout = new TextLayout(source, frameWidth, this._alignment);
    this._frameWidth = frameWidth;
    this._lines = lines;
    this.reset();
  }

  reset(): void {
    this._currentTick = 0;
    this._holdOnLine = this._waitTicksOnLine;
    this._totalTicked = 0;
  }

  tick(): void {
    this._totalTicked++;
    let alignedAtLine = (this._currentTick - (this._scrollIn ? this.viewportHeight : 0)) >= 0
      && (this._currentTick - (this._scrollIn ? this.viewportHeight : 0)) % this.lineHeight === 0
      && (this._currentTick < (this.numLines + 1) * this.ticksPerLine);

    if (alignedAtLine && this._holdOnLine === 0) {
      this._currentTick++;
      let startingOnLastLine = this._currentTick > (this.numLines - 1) * this.ticksPerLine;
      this._holdOnLine = startingOnLastLine && this._waitTicksOnLastLine || this._waitTicksOnLine;
    } else if (alignedAtLine) {
      this._holdOnLine--;
    } else {
      this._currentTick++;
    }
  }

  getAnimationRemaining(): number {
    return (this._waitTicksOnLastLine ? this._waitTicksOnLastLine : this._waitTicksOnLine + this.viewportHeight)
      + (this.numLines - 1) * this.ticksPerLine
      + (this._scrollOut ? this.viewportHeight : 0)
      - this._totalTicked;
  }

  //noinspection JSUnusedGlobalSymbols
  isAnimationComplete(): boolean {
    return this.getAnimationRemaining() <= 0;
  }

  get scrollHeight(): number {
    return this.numLines * this.lineHeight - PADDING_BETWEEN_LINES;
  }

  //noinspection JSMethodCanBeStatic
  get ticksPerLine(): number {
    return 8 + PADDING_BETWEEN_LINES + this._waitTicksOnLine;
  }

  //noinspection JSMethodCanBeStatic
  get lineHeight(): number {
    return 8 + PADDING_BETWEEN_LINES;
  }

  get numLines(): number {
    return this._textLayout.pages.length;
  }

  //noinspection JSMethodCanBeStatic
  padByteStr(byte: Byte | string): string {
    let str = byte + "";
    while (str.length < 8) {
      str = "0" + str;
    }
    return str;
  }

  get viewportHeight(): number {
    return this._lines * this.lineHeight - PADDING_BETWEEN_LINES;
  }


  getTranslatedOnLine(x: number, line: number = 0): Byte {
    let str = this._textLayout.pages
      .map(page => page[x])
      .map(byte => byte || 0)
      .map(byte => byte.toString(2))
      .map(str => this.padByteStr(str))
      .join("00");
    if (this._scrollIn) {
      for (let i = 0; i < this.scrollHeight; i++) {
        str = "0" + str;
      }
    }
    if (this._scrollOut) {
      for (let i = 0; i < this.scrollHeight; i++) {
        str = str + "0";
      }
    }
    let windowStartY = this._currentTick;

    str = str.slice(windowStartY, windowStartY + this.scrollHeight);
    //noinspection UnnecessaryLocalVariableJS
    let start = line * this.lineHeight;
    let lineAdjustedStr = str.substring(start, start + 8);
    return parseInt(lineAdjustedStr, 2);
  }

  getTranslated(idx: number): Byte {
    let line = Math.floor(idx / this._frameWidth);
    let x = idx % this._frameWidth;
    return this.getTranslatedOnLine(x, line);

  };
}
