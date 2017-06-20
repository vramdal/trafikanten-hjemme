// @flow
const font = require("./font");
const BitmapWithControlCharacters = require("./BitmapWithControlCharacters");
import type {Bitmap, ControlCharacterMap} from './BitmapWithControlCharacters';


function isSpecialCharacter(str : string) {
    "use strict";
    if (str === '\t') {
        return true;
    }
}

module.exports =  {
    rastrify: function(text : string) : Bitmap {
        let bitmapWithControlCharacters = rastrifyText(text);
        return expandControlCharacters(bitmapWithControlCharacters, 128);
    }
};

function expandControlCharacters(bitmapWithControlCharacters: BitmapWithControlCharacters, width: number) : Bitmap {
    "use strict";
    if (bitmapWithControlCharacters.controlCharacters.length === 0) {
        return bitmapWithControlCharacters.bitmap;
    }
    if (bitmapWithControlCharacters.controlCharacters.length > 1) {
        throw new Error("Only none or a single control character is supported by now.");
    }
    let ctrl = bitmapWithControlCharacters.controlCharacters[0];
    if (ctrl.character !== "\t") {
        throw new Error("Only tab (\\t) control characters are supported by now");
    }
    let arrayBuffer = new ArrayBuffer(width);
    let bufferView : Uint8Array = new Uint8Array(arrayBuffer);
    bufferView.set(bitmapWithControlCharacters.bitmap);
    let diff = width - bitmapWithControlCharacters.bitmap.length;
    bufferView.copyWithin(ctrl.position + diff, ctrl.position, width);
    bufferView.fill(0, ctrl.position, ctrl.position + diff);
    return bufferView;

}

function rastrifyText(text : string) : BitmapWithControlCharacters  {
    "use strict";
    if (text === null) {
        text = "";
    }
    let ctrl : ControlCharacterMap = [];
    let bufferSize = findRequiredBufferSize(text);
    let arrayBuffer = new ArrayBuffer(bufferSize);
    let bufferView = new Uint8Array(arrayBuffer);
    let offset = 0;
    for (let c = 0; c < text.length; c++) {
        let ch : string = text[c];
        if (font[ch]) {
            bufferView.set(font[ch].bytes, offset);
            offset += font[ch].width;
        } else if (isSpecialCharacter(ch)) {
            ctrl[offset] = {position: offset, character: ch};
        } else if (font[ch.charCodeAt(0)]) {
            bufferView.set(font[ch.charCodeAt(0)].bitmap, offset);
            offset += font[ch.charCodeAt(0)].width;
        } else {
            window.console.warn("Ukjent tegn: " + ch);
        }
        if (c < text.length - 1) {
            offset += 1;
        }
    }
    return new BitmapWithControlCharacters(bufferView, ctrl);

}

function findRequiredBufferSize(line) : number {
    let bufferSize : number = 0;
    for (let c = 0; c < line.length; c++) {
        let ch = line[c];
        if (font[ch]) {
            bufferSize += font[ch].width;
        } else if (font[ch.charCodeAt(0)]) {
            bufferSize += font[ch.charCodeAt(0)].width;
        }
        if (c < line.length - 1) {
            bufferSize += 1;
        }
    }
    return bufferSize;
}
