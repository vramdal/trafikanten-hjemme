// @flow

const Display = require("./Display.js");
const BitmapUtil = require("../BitmapUtil.js");

import type {DisplayInterface} from "./DisplayInterface";
import type {BytePosition} from "./BytePosition";


class ConsoleDisplay extends Display implements DisplayInterface {

    constructor() {
        super();
    }

    //noinspection JSMethodCanBeStatic
    output() {
        BitmapUtil.bitmapTo8Lines(this.buffer.slice(0, 128));
        BitmapUtil.bitmapTo8Lines(this.buffer.slice(128));
    }

    getPositionTranslator() : (x : number, y : number) => BytePosition {
        return (x, y) => ({x, y});
    }
}


module.exports = ConsoleDisplay;