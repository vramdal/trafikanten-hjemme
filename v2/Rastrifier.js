// @flow
const font = require("./font");
const BitmapWithControlCharacters = require("./BitmapWithControlCharacters");
import type {Bitmap, RenderControlAtPosition, RenderControlMap} from './BitmapWithControlCharacters';
import type {FontCharSpec} from './font';
import type {Char} from './SimpleTypes';
const TabRenderModifier = require("./rendermodifiers/TabRenderModifier");
const AlignCenterRenderModifier = require("./rendermodifiers/AlignCenterRenderModifier");

export interface RenderModifier {
    render(bufferView: Uint8Array, renderModifier: RenderControlAtPosition, contentPixelLength: number) : void
}

const renderModifiers : {[Char] : RenderModifier} = {
    "\t": new TabRenderModifier(), "\x01": new AlignCenterRenderModifier()
};

function isControlCharacter(str : string) {
    "use strict";
    return renderModifiers[str];
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
    let arrayBuffer = new ArrayBuffer(width);
    let bufferView : Uint8Array = new Uint8Array(arrayBuffer);
    bufferView.set(bitmapWithControlCharacters.bitmap);
    for (let renderControlAtPosition of bitmapWithControlCharacters.renderControls) {
        renderModifiers[renderControlAtPosition.character].render(bufferView, renderControlAtPosition, bitmapWithControlCharacters.bitmap.length);
    }
    return bufferView;
}

function rastrifyText(text : string) : BitmapWithControlCharacters  {
    "use strict";
    let glyphs : Array<FontCharSpec> = [];
    let controlCharacterMap : ControlCharacterMap = [];
    let plainText = "";
    for (let chIdx = 0; chIdx < text.length; chIdx++) {
        let ch : Char = text[chIdx];
        if (isControlCharacter(ch)) {
            let controlCharacterAtPosition : ControlCharacterAtPosition = {position: chIdx, character: ch};
            controlCharacterMap.push(controlCharacterAtPosition);
        } else {
            glyphs.push(font[ch]);
            plainText += ch;
        }
    }
    let renderControlsAtPositions : RenderControlMap = [];
    let glyphsAtPosition : Array<GlyphAtPosition> = [];

    let glyphBufferSize = glyphs.map(glyph => glyph.width).reduce((accumulator, currentValue, currentIndex, array) => {
        let controlCharacterAtPosition = controlCharacterMap.find(controlCharacterAtPosition => controlCharacterAtPosition.position === currentIndex);
        if (controlCharacterAtPosition) {
            renderControlsAtPositions.push({x: accumulator, character: controlCharacterAtPosition.character});
        }
        glyphsAtPosition.push({x: accumulator, glyph: glyphs[currentIndex]});
        let isLast = currentIndex >= array.length - 1;
        return accumulator + currentValue + (isLast ? 0 : 1);
    }, 0);

    let arrayBuffer = new ArrayBuffer(glyphBufferSize);
    let bufferView = new Uint8Array(arrayBuffer);

    glyphsAtPosition.forEach(glyphAtPosition => bufferView.set(glyphAtPosition.glyph.uint8Array, glyphAtPosition.x));

    return new BitmapWithControlCharacters(bufferView, renderControlsAtPositions);
}

type ControlCharacterAtPosition = {position: number, character: string};
type ControlCharacterMap = Array<ControlCharacterAtPosition>;
type GlyphAtPosition = {glyph: FontCharSpec, x: number};

