// @flow
import type {Bitmap} from "./Bitmap";
import type {Layout} from "./Frame";
import type {BytePosition} from "./display/BytePosition";
import type {Rectangle} from "./Rectangle";
const Frame = require("./Frame.js");

class Collage {
    _layout: Layout;

    constructor(layout : Layout) {
        this._layout = layout;
    }

    pasteTo(target : Bitmap, positionTranslator : (bitmap : Bitmap, rectangle : Rectangle) => {bitmap : Bitmap, rectangle : Rectangle}) {
        this._layout.forEach((frame: Frame, idx : number) => {
            try {
                // TODO: Use PositionTranslator
                if (frame.isLineConstrained) {
                    for (let lineIdx = 0; lineIdx < frame.lines; lineIdx++) {
                        target.set(frame.getBitmap(lineIdx), frame.x + lineIdx * frame.width);
                    }
                } else {
                    let {bitmap : translatedBitmap, rectangle : translatedRectangle} = positionTranslator(frame.bitmap, frame.rectangle);
                    target.set(translatedBitmap, translatedRectangle.x);
                }
            } catch (e) {
                throw new Error(`Attempting to paste a ${frame.width}-width bitmap on position ${frame.x} on a ${target.length}-width target in frame ${idx}\n${e.message}`);
            }
        });
    }
}

module.exports = Collage;