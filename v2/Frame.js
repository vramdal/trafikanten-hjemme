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
    _width : number;
    _x: number;
    _animation: Animation;
    _bitmap : Bitmap;

    constructor(x: number, width : number, animation : Animation) {
        this._x = x;
        this._width = width;
        this._animation = animation;
    }

    setBitmap(source: AnnotatedBitmap) {
        this._animation.setSource(source, this._width);
        this._bitmap = new BitmapProxy(source, this._width, this._animation.getTranslated.bind(this._animation));
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

    get bitmap(): Bitmap {
        return this._bitmap;
    }

    get x(): number {
        return this._x;
    }
}

module.exports = Frame;