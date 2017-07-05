// @flow

import type {AnnotatedBitmap} from "../Bitmap";

export interface CharacterProcessor {

    processCharacter(fullString : string, chIdx : number) : number;
    mapCharacterToPosition(chIdx : number, x: number) : void;
    place(bitmap : AnnotatedBitmap, contentLength: number) : void;

}


