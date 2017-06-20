// @flow
const font = require("./font");
const BitmapWithControlCharacters = require("./BitmapWithControlCharacters");
import type {Bitmap, ControlCharacterMap} from './BitmapWithControlCharacters';
import type {FontCharSpec} from './font';

function isControlCharacter(str : string) {
    "use strict";
    if (str === '\t') {
        return true;
    }
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
    if (ctrl.character !== "\t") {
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
    processLine(text,
        (fontCharSpec : FontCharSpec, isFirstCharacter, isLastCharacter) => {
            bufferView.set(fontCharSpec.bytes, offset);
            offset += fontCharSpec.width;
            if (!isLastCharacter) {
                offset += 1;
            }
        },
        ch => {
            ctrl.push({position: offset, character: ch});
        });
    return new BitmapWithControlCharacters(bufferView, ctrl);
}

type ControlCharacterHandler = (ch: string, isFirstCharacter: boolean, isLastCharacter: boolean) => void;
type FontCharacterHandler = (fontCharSpec : FontCharSpec, isFirstCharacter: boolean, isLastCharacter: boolean) => void;

function findRequiredBufferSize(line : string) {
    "use strict";
    let bufferSize : number = 0;
    let fontCharacterHandler = (fontCharSpec : FontCharSpec, isFirstCharacter : boolean, isLastCharacter : boolean) => {
        "use strict";
        bufferSize += fontCharSpec.width;
        if (!isLastCharacter) {
            bufferSize += 1;
        }
    };
    let controlCharacterHandler = () => {
        "use strict";
        bufferSize += 0;
    };
    processLine(line, fontCharacterHandler, controlCharacterHandler);
    return bufferSize;
}

function processLine(line, fontCharacterHandler: FontCharacterHandler, controlCharacterHandler: ControlCharacterHandler) : void {
    for (let c = 0; c < line.length; c++) {
        let ch = line[c];
        if (isControlCharacter(ch)) {
            controlCharacterHandler(ch, c === 0, c >= line.length - 1);
        } else if (ch) {
            let fontBitMap = font[ch] || font[ch.charCodeAt(0)];
            fontCharacterHandler(fontBitMap, c === 0, c >= line.length - 1);
        } else {
            console.warn("Ukjent tegn: ", ch);
        }
    }
}
