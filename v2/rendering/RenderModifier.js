// @flow

import type {Char} from "../SimpleTypes";
export interface RenderModifier {
    render(bufferView: Uint8Array, renderControlAtPosition: RenderControlAtPosition, contentPixelLength: number) : void
}
export type RenderControlAtPosition = {x: number, character: Char, parameters: string};
export type RenderControlMap = Array<RenderControlAtPosition>;