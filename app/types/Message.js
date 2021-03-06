// @flow

import type {Layout} from "../bitmap/Frame";
const Frame = require("../bitmap/Frame.js");
const NoAnimation = require("../animations/NoAnimation.js");

//noinspection JSUnusedLocalSymbols
function defaultLayout() {
    return [new Frame(0, 128, new NoAnimation(10, "left"))];
}

export type TextInFrame = {
    text : string,
    frame : Frame
}

class Message {

    _parts: Array<TextInFrame>;

    constructor(parts : Array<TextInFrame>) {
        this._parts = parts;
    }

    get text(): string {
        return this._parts.map(part => part.text).join("\n");
    }

    get parts() : Array<TextInFrame> {
        return this._parts;
    }

    get layout(): Layout {
        return this._parts.map(part => part.frame);
    }

    toString() {
        return this._parts.map(part => part.text).join(" | ");
    }
}

module.exports = Message;