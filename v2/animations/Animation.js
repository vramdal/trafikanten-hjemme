// @flow

import type {Byte} from "../SimpleTypes";
import type {AnnotatedBitmap} from "../Bitmap.js";

export interface Animation {

    setSource(source : AnnotatedBitmap, frameWidth : number, lines : number) : void;
    tick() : void;
    reset() : void;
    getTranslated(idx : number) : Byte;
    isAnimationComplete() : boolean;
    getAnimationRemaining() : number;
    getTranslatedOnLine(x : number, line : number) : Byte;

}