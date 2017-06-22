// @flow
/**
 * An X by 8 pixel bitmap
 */
//import type {RenderModifier} from './Rastrifier.js';
import type {Char} from './SimpleTypes.js';
export type Bitmap = Uint8Array;
export type RenderControlAtPosition = {x: number, character: Char, parameters: string};

export type RenderControlMap = Array<RenderControlAtPosition>;

//noinspection JSUnusedLocalSymbols
module.exports = class BitmapWithControlCharacters {

    _bitmap : Bitmap;
    _renderControls : RenderControlMap;
    _clip : number;

    /**
     * @param bitmap An array of bytes, each byte corresponding to a column of the bitmap.
     * @param renderControls An array where control characters are placed. The array's length should equal size of
     * {@link bitmap}. If a control character should be placed in front of
     * byte 6, the control character should be placed at <code>controlCharacters[6]</code>.
     * @param clip Optional. If set to a number, it specifies that anything to the right of <code>graphicLength</code> should
     * be considered not used (blank). If <code>false</code>, will use the width of {@link bitmap}.
     * If not set, the value will be calculated.
     */
    constructor(bitmap: Bitmap, renderControls: RenderControlMap = [], clip : ?number | boolean) {
        this._bitmap = bitmap;
        this._renderControls = renderControls;
        if (typeof clip === 'number') {
            this._clip = clip;
        } else if (clip === false) {
            this._clip = this._bitmap.length;
        } else {
            this._clip = 0;
            for (let i = 0; i < this._bitmap.length; i++) {
                if (this._bitmap[i] !== 0) {
                    this._clip = i + 1;
                }
            }
        }
    }

    get bitmap() : Bitmap {
        return this._bitmap;
    }

    get renderControls() : RenderControlMap {
        return this._renderControls;
    }

    get clip(): number {
        return this._clip;
    }
};