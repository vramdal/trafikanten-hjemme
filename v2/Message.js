// @flow

import type {Layout} from "./Frame";


class Message {

    _text : string;
    _layout: ?Layout; // TODO: Make mandatory

    constructor(text: string, layout?: Layout) {
        this._text = text;
        this._layout = layout;
    }

    get text(): string {
        return this._text;
    }

    get layout(): ?Layout {
        return this._layout;
    }
}

module.exports = Message;