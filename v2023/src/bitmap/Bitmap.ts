/**
 * An X by 8 pixel bitmap
 */
export type Bitmap = Uint8Array;

export interface BitmapAnnotation {

    start: number,
    end: number,
}

export type AnnotatedBitmap = Bitmap & {
    annotations: Array<BitmapAnnotation>,
    sourceString? : string
}

//noinspection JSUnusedLocalSymbols
export class BitmapClipped {

    _bitmap : Bitmap;
    _clip : number;

    /**
     * @param bitmap An array of bytes, each byte corresponding to a column of the bitmap.
     * @param clip Optional. If set to a number, it specifies that anything to the right of <code>graphicLength</code> should
     * be considered not used (blank). If <code>false</code>, will use the width of {@link bitmap}.
     * If not set, the value will be calculated.
     */
    constructor(bitmap: Bitmap, clip ?: number | boolean) {
        this._bitmap = bitmap;
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

    get clip(): number {
        return this._clip;
    }
}

export class MultilineBitmap extends Array<Bitmap> {

    getByteStack(x : number, paddingBits : number = 0) : number {
        return super.reduce((byteStack, bitmap) => byteStack << 8 + paddingBits | bitmap[x], 0);
    }

}

