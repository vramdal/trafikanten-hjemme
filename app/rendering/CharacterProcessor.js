// @flow

import type {AnnotatedBitmap} from "../bitmap/Bitmap";
import type {FontCharSpec} from "./font";

export interface CharacterProcessor {

    processCharacter(fullString : string, chIdx : number) : Array<(?FontCharSpec)>;
    mapCharacterToPosition(chIdx : number, x: number) : number;
    place(bitmap : AnnotatedBitmap, contentLength: number) : void;

}


