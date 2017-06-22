// @flow

import type {RenderControlAtPosition} from '../BitmapWithControlCharacters.js';
import type {RenderModifier} from '../Rastrifier.js';

class AlignCenterRenderModifier implements RenderModifier {

    //noinspection JSMethodCanBeStatic
    render(bufferView: Uint8Array, tabCtrl: RenderControlAtPosition, contentPixelLength: number) {
        // TODO
/*
        let diff = bufferView.length - contentPixelLength;
        bufferView.copyWithin(tabCtrl.x + diff, tabCtrl.x, bufferView.length);
        bufferView.fill(0, tabCtrl.x, tabCtrl.x + diff);
*/
    }
}

module.exports = AlignCenterRenderModifier;
