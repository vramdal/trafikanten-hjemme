// @flow
const font = require("./font");
const BitmapWithControlCharacters = require("./BitmapWithControlCharacters");
import type {Bitmap, ControlCharacterMap} from './BitmapWithControlCharacters';

function isControlCharacter(str : string) {
    "use strict";
    if (str === '\t') {
        return true;
    }
}

function parseControlCharacters(str : string) : ?string {
    "use strict";
    let result = "";
    for (let c = 0; c < str.length && isControlCharacter(str[c]); c++) {
        result += str[c];
    }
    return result;
}

module.exports =  {
    rastrify: function(text : string) : Bitmap {
        let bitmapWithControlCharacters = rastrifyText(text);
        return expandControlCharacters(bitmapWithControlCharacters, 128);
    },
    _testing: {
        rastrifyText
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
    if (ctrl.character !== "\t" && ctrl.character !== "\t\t") {
        throw new Error("Only tab (\\t) control characters are supported by now");
    }
    let arrayBuffer = new ArrayBuffer(width);
    let bufferView : Uint8Array = new Uint8Array(arrayBuffer);
    bufferView.set(bitmapWithControlCharacters.bitmap);
    let diff = width - bitmapWithControlCharacters.bitmap.length; // 128 - 62 = 66 (hvor kommer 62 fra? burde vært 56)
    bufferView.copyWithin(ctrl.position + diff, ctrl.position, width); // 26 + 66 = 92, 26, 128
    bufferView.fill(0, ctrl.position, ctrl.position + diff); // 0, 26, 92
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
    let numControlCharacters = 0;
    for (let c = 0; c < text.length; c++) {
        let ch : string = text[c];
        let controlCharacterString = parseControlCharacters(text.substring(c));
        if (controlCharacterString) {
            ctrl.push({position: offset, character: controlCharacterString});
            numControlCharacters += controlCharacterString.length;
            c += numControlCharacters - 1;
        } else if (font[ch]) {
            bufferView.set(font[ch].bytes, offset);
            offset += font[ch].width;
        } else if (font[ch.charCodeAt(0)]) {
            bufferView.set(font[ch.charCodeAt(0)].bitmap, offset);
            offset += font[ch.charCodeAt(0)].width;
        } else {
            window.console.warn("Ukjent tegn: " + ch);
        }
        if ((c < text.length - 1) && !controlCharacterString) {
            offset += 1;
        }
    }
    return new BitmapWithControlCharacters(bufferView, ctrl);

}



function findRequiredBufferSize(line : string) : number {
    let bufferSize : number = 0;
    for (let c = 0; c < line.length; c++) {
        let controlCharacters = parseControlCharacters(line.substring(c));
        let ch = line[c];
        if (controlCharacters) {
            c += controlCharacters.length - 1;
            bufferSize += 0;
        } else if (font[ch]) {
            bufferSize += font[ch].width;
        } else if (font[ch.charCodeAt(0)]) {
            bufferSize += font[ch.charCodeAt(0)].width;
        }
        if (c < line.length - 1 && !controlCharacters) {
            bufferSize += 1;
        }
    }
    return bufferSize;
}
