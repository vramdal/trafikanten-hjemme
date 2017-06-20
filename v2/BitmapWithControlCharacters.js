// @flow
/**
 * An X by 8 pixel bitmap
 */
export type Bitmap = Uint8Array;

export type ControlCharacterMap = Array<{position: number, character: string}>;

//noinspection JSUnusedLocalSymbols
module.exports = class BitmapWithControlCharacters {

    _bitmap : Bitmap;
    _controlCharacters : ControlCharacterMap;

    /**
     * @param bitmap An array of bytes, each byte corresponding to a column of the bitmap.
     * @param controlCharacters An array where control characters are placed. The array's length should equal size of
     * {@link bitmap}. If a control character should be placed in front of
     * byte 6, the control character should be placed at <code>controlCharacters[6]</code>.
     */
    constructor(bitmap: Bitmap, controlCharacters: ControlCharacterMap = []) {
        this._bitmap = bitmap;
        this._controlCharacters = controlCharacters;
    }

    get bitmap() : Bitmap {
        return this._bitmap;
    }

    get controlCharacters() : ControlCharacterMap {
        return this._controlCharacters;
    }
};