// @flow

import type {AnnotatedBitmap} from "../Bitmap";
import type {FontCharSpec} from "../font";

export interface CharacterProcessor {

    processCharacter(fullString : string, chIdx : number) : Array<(?FontCharSpec)>;
    mapCharacterToPosition(chIdx : number, x: number) : void;
    place(bitmap : AnnotatedBitmap, contentLength: number) : void;

}


