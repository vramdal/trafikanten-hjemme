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
        this._layout.forEach((frame : Frame) => target.set(frame.bitmap, frame.x));
    }
}

module.exports = Collage;