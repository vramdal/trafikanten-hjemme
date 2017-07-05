// @flow

import type {Byte} from "../SimpleTypes";
import type {AnnotatedBitmap} from "../Bitmap.js";

export interface Animation {

    setSource(source : AnnotatedBitmap, frameWidth: number) : void;
    tick() : void;
    reset() : void;
    getTranslated(idx : number) : Byte;
    isAnimationComplete() : boolean;
    getAnimationRemaining() : number;

}