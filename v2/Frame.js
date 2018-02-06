// @flow

import type {AnnotatedBitmap, Bitmap} from "./Bitmap";
import type {Animation} from "./animations/Animation";
import type {Rectangle} from "./Rectangle";

const BitmapProxy = require("./BitmapProxy.js");
/**
 * When the returned number is 0, the scroll has completed a full cycle
 */
export type AnimationTickPromise = Promise<void>;
export type Layout = Array<Frame>;

class Frame {
    // TODO: Support multi-line
    _width : number;
    _x: number;
    _y: number;
    _animation: Animation;
    _bitmaps: Array<Bitmap>;
    _lines: number;
    _isLineConstrained : boolean;
    _heightPx: number;

    constructor(x: number, width : number, animation : Animation, lines : number = 1, heightPx : ?number) {
        this._x = x;
        this._y = 0; // TODO
        this._width = width;
        this._animation = animation;
        this._lines = lines;
/*        if (lines !== undefined && heightPx !== undefined) {
            throw new Error("Either lines or heightPx must be specified, but not both");
        } else */
        if (heightPx != null) {
            this._heightPx = heightPx;
        } else if (lines !== undefined) {
            this._isLineConstrained = lines !== undefined;
            this._heightPx = lines * 10 - 2;
        }
        if (lines === undefined && heightPx === undefined) {
            throw new Error("Either lines or heightPx must be specified");
        }
    }

    setBitmap(source: AnnotatedBitmap) {
        this._animation.setSource(source, this._width, this._lines);
        let bitmaps = [];
        for (let bitmapIdx = 0; bitmapIdx < this._lines; bitmapIdx++) {
            bitmaps.push(new BitmapProxy(source, this._width, this.translateCoordinates.bind(this, bitmapIdx)));
        }
        this._bitmaps = bitmaps;
    }

    translateCoordinates(line : number, x : number) {
        let idx = x + line * this._width;
        if (this._animation.getTranslatedOnLine) {
            return this._animation.getTranslatedOnLine(x, line);
        } else {
            return this._animation.getTranslated(idx);
        }
    }


    tick() : AnimationTickPromise {
        return new Promise((resolve, reject) => {
            try {
                this._animation.tick();
                return resolve();
            } catch (e) {
                return reject(e);
            }
        });
    }

    get animationComplete() : boolean {
        return this._animation.isAnimationComplete();
    }

    get animationRemaining() : number {
        return this._animation.getAnimationRemaining();
    }

    get width(): number {
        return this._width;
    }

    get heightPx() : number {
        if (this.isLineConstrained) {
            return this._lines * 10 - 2;
        } else {
            return this._heightPx;
        }
    }

    get lines(): number {
        return this._lines;
    }

    get bitmap(): Bitmap {
        return this._bitmaps[0];
    }

    get isLineConstrained() : boolean {
        return this._isLineConstrained;
    }

    getBitmap(lineIdx : number) : Bitmap {
        return this._bitmaps[lineIdx];
    }

    get x(): number {
        return this._x;
    }

    get y(): number {
        return this._y;
    }

    get rectangle() : Rectangle {
        return {x: this._x, y: this._y, width: this._width, height: this._heightPx};
    }
}

module.exports = Frame;