// @flow

import type {RenderControlAtPosition} from '../BitmapWithControlCharacters.js';
import type {RenderModifier} from '../Rastrifier.js';

class CutoffRenderModifier implements RenderModifier {
    _maxPixels : number;


    constructor(maxPixels : number) {
        this._maxPixels = maxPixels;
    }

//noinspection JSMethodCanBeStatic,JSUnusedLocalSymbols
    render(bufferView: Uint8Array, controlAtPosition:  RenderControlAtPosition, contentPixelLength: number) {
        if (contentPixelLength < this._maxPixels) {
            return;
        }
        bufferView.fill(0, this._maxPixels);
    }

}

module.exports = CutoffRenderModifier;
