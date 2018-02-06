// @flow

import type {BytePosition} from "./BytePosition";
export interface DisplayInterface {
    output() : void;
    getPositionTranslator() : (x : number, y : number) => BytePosition
}