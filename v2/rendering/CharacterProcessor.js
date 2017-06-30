// @flow

import type {Bitmap} from "../Bitmap";

export interface CharacterProcessor {

    processCharacter(fullString : string, chIdx : number) : number;
    mapCharacterToPosition(chIdx : number, x: number) : void;
    place(bitmap : Bitmap, contentLength: number) : void;

}


