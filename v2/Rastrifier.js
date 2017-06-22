// @flow
const font = require("./font");
const BitmapWithControlCharacters = require("./BitmapWithControlCharacters");
import type {Bitmap, RenderControlAtPosition, RenderControlMap} from './BitmapWithControlCharacters';
import type {FontCharSpec} from './font';
import type {Char} from './SimpleTypes';
const TabRenderModifier = require("./rendermodifiers/TabRenderModifier");

export interface RenderModifier {
    render(bufferView: Uint8Array, renderModifier: RenderControlAtPosition, contentPixelLength: number) : void
}

const renderModifiers : {[Char] : RenderModifier} = {
    "\t": new TabRenderModifier()
};

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
    if (bitmapWithControlCharacters.renderControls.length === 0) {
        return bitmapWithControlCharacters.bitmap;
    }
    if (bitmapWithControlCharacters.renderControls.length > 1) {
        throw new Error("Only none or a single control character is supported by now.");
    }
    let ctrl = bitmapWithControlCharacters.renderControls[0];
    if (ctrl.character !== "\t") {
        throw new Error("Only tab (\\t) control characters are supported by now");
    }
    let arrayBuffer = new ArrayBuffer(width);
    let bufferView : Uint8Array = new Uint8Array(arrayBuffer);
    bufferView.set(bitmapWithControlCharacters.bitmap);
    // expandTab(bufferView, ctrl, bitmapWithControlCharacters.bitmap.length);
    renderModifiers[ctrl.character].render(bufferView, ctrl, bitmapWithControlCharacters.bitmap.length);
    return bufferView;
}

let defaultControlCharacterExtractor : ControlCharacterExtractor = function controlCharacterExtractor(str: string) : StringAndControlCharacters {
    let cleanedString = "";
    let controlCharacterMap : ControlCharacterMap = [];
    for (let i = 0; i < str.length; i++) {
        let ch = str[i];
        if (isControlCharacter(ch)) {
            controlCharacterMap.push({position: i, character: ch});
        } else {
            cleanedString += ch;
        }
    }
    return {string: cleanedString, controlCharacters: controlCharacterMap};
};

function rastrifyText(text : string) : BitmapWithControlCharacters  {
    "use strict";
    if (text === null) {
        text = "";
    }
    let stringAndControlCharacters = defaultControlCharacterExtractor(text);
    let bufferSize = findRequiredBufferSize(stringAndControlCharacters.string);
    let arrayBuffer = new ArrayBuffer(bufferSize);
    let bufferView = new Uint8Array(arrayBuffer);
    let offset = 0;
    let ctrl : RenderControlMap = [];
    let ctrlOld = [];
    processLine(stringAndControlCharacters.string,
        (fontCharSpec : FontCharSpec, charIdx : number, isFirstCharacter, isLastCharacter) => {
            let controlCharacterAtPosition = stringAndControlCharacters.controlCharacters.find(
                (controlCharacterAtPosition : ControlCharacterAtPosition) => controlCharacterAtPosition.position === charIdx);
            if (controlCharacterAtPosition) {
                let renderControlAtPosition : RenderControlAtPosition = {x: offset, character: controlCharacterAtPosition.character};
                ctrl.push(renderControlAtPosition);
            }
            try {
                bufferView.set(fontCharSpec.uint8Array, offset);
            } catch (e) {
                if (e instanceof RangeError) {
                    throw new Error("Bufferet har " + bufferSize + " plass. Ikke plass til " + fontCharSpec.uint8Array.length + " på posisjon " + offset + " til tegnet " + fontCharSpec.char);
                }
            }
            offset += fontCharSpec.width;
            if (!isLastCharacter) {
                offset += 1;
            }
        },
        ch => {
            ctrlOld.push({x: offset, character: ch});
        });
    return new BitmapWithControlCharacters(bufferView, ctrl);
}

type ControlCharacterAtPosition = {position: number, character: string};
type ControlCharacterMap = Array<ControlCharacterAtPosition>;
type StringAndControlCharacters = {controlCharacters: ControlCharacterMap, string: string};
type ControlCharacterExtractor = (str: string) => StringAndControlCharacters;
type ControlCharacterHandler = (ch: string, charIdx: number, isFirstCharacter: boolean, isLastCharacter: boolean) => void;
type FontCharacterHandler = (fontCharSpec : FontCharSpec, charIdx : number, isFirstCharacter: boolean, isLastCharacter: boolean) => void;

function findRequiredBufferSize(line : string) {
    "use strict";
    let bufferSize : number = 0;
    let fontCharacterHandler = (fontCharSpec : FontCharSpec, charIdx : number, isFirstCharacter : boolean, isLastCharacter : boolean) => {
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
        if (ch) {
            let fontCharSpec = font[ch] || font[ch.charCodeAt(0)];
            fontCharacterHandler(fontCharSpec, c, c === 0, c >= line.length - 1);
        } else {
            window.console.warn("Ukjent tegn: ", ch);
        }
    }
}
