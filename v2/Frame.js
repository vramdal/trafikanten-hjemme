// @flow

import type {AnnotatedBitmap, Bitmap} from "./Bitmap";
import type {Animation} from "./animations/Animation";

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
    _animation: Animation;
    _bitmaps: Array<Bitmap>;
    _lines: number;

    constructor(x: number, width : number, animation : Animation, lines : number = 1) {
        this._x = x;
        this._width = width;
        this._animation = animation;
        this._lines = lines;
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
        return this._animation.getTranslated(idx);
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

    get lines(): number {
        return this._lines;
    }

    get bitmap(): Bitmap {
        return this._bitmaps[0];
    }

    getBitmap(lineIdx : number) : Bitmap {
        return this._bitmaps[lineIdx];
    }

    get x(): number {
        return this._x;
    }
}

module.exports = Frame;