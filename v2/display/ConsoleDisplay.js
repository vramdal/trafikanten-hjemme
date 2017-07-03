// @flow

const Display = require("./Display.js");
const BitmapUtil = require("../BitmapUtil.js");

import type {DisplayInterface} from "./DisplayInterface";


class ConsoleDisplay extends Display implements DisplayInterface {

    constructor() {
        super();
    }

    //noinspection JSMethodCanBeStatic
    output() {
        BitmapUtil.bitmapTo8Lines(this.buffer.slice(0, 128));
        BitmapUtil.bitmapTo8Lines(this.buffer.slice(128));
    }
}

module.exports = ConsoleDisplay;