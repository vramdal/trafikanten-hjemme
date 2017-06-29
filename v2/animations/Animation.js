// @flow

import type {Byte} from "../SimpleTypes";
import type {Bitmap} from "../BitmapWithControlCharacters";
export interface Animation {

    setSource(source : Bitmap, frameWidth: number) : void;
    tick() : void;
    reset() : void;
    getTranslated(idx : number) : Byte;
    get animationComplete() : boolean;
    get animationRemaining() : number;

}