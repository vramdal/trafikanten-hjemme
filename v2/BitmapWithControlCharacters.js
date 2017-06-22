// @flow
/**
 * An X by 8 pixel bitmap
 */
export type Bitmap = Uint8Array;
export type RenderControlAtPosition = {x: number, character: string};

export type RenderControlMap = Array<RenderControlAtPosition>;

//noinspection JSUnusedLocalSymbols
module.exports = class BitmapWithControlCharacters {

    _bitmap : Bitmap;
    _renderControls : RenderControlMap;

    /**
     * @param bitmap An array of bytes, each byte corresponding to a column of the bitmap.
     * @param renderControls An array where control characters are placed. The array's length should equal size of
     * {@link bitmap}. If a control character should be placed in front of
     * byte 6, the control character should be placed at <code>controlCharacters[6]</code>.
     */
    constructor(bitmap: Bitmap, renderControls: RenderControlMap = []) {
        this._bitmap = bitmap;
        this._renderControls = renderControls;
    }

    get bitmap() : Bitmap {
        return this._bitmap;
    }

    get renderControls() : RenderControlMap {
        return this._renderControls;
    }
};