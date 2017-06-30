// @flow

import type {Layout} from "./Frame";
const Frame = require("./Frame.js");
const NoAnimation = require("./animations/NoAnimation.js");
//const Scrolling = require("./animations/Scrolling.js");

function defaultLayout() {
    return [new Frame(0, 128, new NoAnimation(10))];
}


class Message {

    _text : string;
    _layout: Layout;

    constructor(text: string, layout: ?Layout) {
        this._text = text;
        this._layout = layout || defaultLayout();
    }

    get text(): string {
        return this._text;
    }

    get layout(): Layout {
        return this._layout;
    }

    toString() {
        return this._text;
    }
}

module.exports = Message;