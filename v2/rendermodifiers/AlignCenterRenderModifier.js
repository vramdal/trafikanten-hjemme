// @flow

import type {RenderControlAtPosition} from '../BitmapWithControlCharacters.js';
import type {RenderModifier} from '../Rastrifier.js';

class AlignCenterRenderModifier implements RenderModifier {

    //noinspection JSMethodCanBeStatic,JSUnusedLocalSymbols
    render(bufferView: Uint8Array, controlAtPosition: RenderControlAtPosition, contentPixelLength: number) {
        let diff = bufferView.length - contentPixelLength;
        let leftPad = Math.floor(diff / 2);
        let rightPad = Math.ceil(diff / 2);
        bufferView.copyWithin(leftPad, 0, contentPixelLength);
        bufferView.fill(0, 0, leftPad);
        bufferView.fill(0, bufferView.length - rightPad);
    }
}

module.exports = AlignCenterRenderModifier;
