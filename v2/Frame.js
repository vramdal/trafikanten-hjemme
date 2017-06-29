// @flow

import type {Bitmap} from "./BitmapWithControlCharacters";
import type {Animation} from "./animations/Animation";

/**
 * When the returned number is 0, the scroll has completed a full cycle
 */
export type AnimationTickPromise = Promise<void>;
export type Layout = Array<Frame>;

class Frame { // TODO: this should really be called ScrollFrame. Make abstract class.
    _width : number;
    _x: number;
    _animation: Animation;

    constructor(x: number, width : number, animation : Animation) {
        this._x = x;
        this._width = width;
        this._animation = animation;
    }

    setBitmap(source: Bitmap) {
        this._animation.setSource(source, this._width);
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
        return this._animation.animationComplete;
    }

    get animationRemaining() : number {
        return this._animation.animationRemaining;
    }

    get width(): number {
        return this._width;
    }

    get bitmap(): Bitmap {
        return this._animation.bitmap;
    }

    get x(): number {
        return this._x;
    }
}

module.exports = Frame;