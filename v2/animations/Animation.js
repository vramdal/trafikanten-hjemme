// @flow

import type {Byte} from "../SimpleTypes";
import type {Bitmap} from "../Bitmap.js";

export interface Animation {

    setSource(source : Bitmap, frameWidth: number) : void;
    tick() : void;
    reset() : void;
    getTranslated(idx : number) : Byte;
    isAnimationComplete() : boolean;
    getAnimationRemaining() : number;

}