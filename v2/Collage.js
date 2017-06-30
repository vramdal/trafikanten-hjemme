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
        target.fill(0);
            this._layout.forEach((frame: Frame, idx : number) => {
                try {
                    // TODO: Something bad happens when frame.x !== 0
                    return target.set(frame.bitmap, frame.x);
                } catch (e) {
                    throw new Error(`Attempting to paste a ${frame.width}-width bitmap on to a ${target.length}-width target in frame ${idx}\n${e.message}`);
                }
            });
    }
}

module.exports = Collage;