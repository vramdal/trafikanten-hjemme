// @flow
import type {Bitmap} from "./Bitmap";
import type {Layout} from "./Frame";
const Frame = require("./Frame.js");

class Collage {
    _layout: Layout;

    constructor(layout : Layout) {
        this._layout = layout;
    }

    pasteTo(target : Bitmap) {
        this._layout.forEach((frame: Frame, idx : number) => {
            try {
                return target.set(frame.bitmap, frame.x);
            } catch (e) {
                throw new Error(`Attempting to paste a ${frame.width}-width bitmap on position ${frame.x} on a ${target.length}-width target in frame ${idx}\n${e.message}`);
            }
        });
    }
}

module.exports = Collage;