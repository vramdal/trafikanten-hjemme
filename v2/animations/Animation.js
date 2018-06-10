// @flow

import type {Byte} from "../types/SimpleTypes";
import type {AnnotatedBitmap} from "../bitmap/Bitmap.js";

export interface Animation {

    setSource(source : AnnotatedBitmap, frameWidth : number, lines : number) : void;
    tick() : void;
    reset() : void;
    getTranslated(idx : number) : Byte;
    isAnimationComplete() : boolean;
    getAnimationRemaining() : number;
    getTranslatedOnLine(x : number, line : number) : Byte;

}