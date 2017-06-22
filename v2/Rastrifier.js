// @flow
const font = require("./font");
const BitmapWithControlCharacters = require("./BitmapWithControlCharacters");
import type {Bitmap, RenderControlAtPosition, RenderControlMap} from './BitmapWithControlCharacters';
import type {FontCharSpec} from './font';
import type {Char} from './SimpleTypes';
const TabRenderModifier = require("./rendermodifiers/AlignRightRenderModifier");
const AlignCenterRenderModifier = require("./rendermodifiers/AlignCenterRenderModifier");

export interface RenderModifier {
    render(bufferView: Uint8Array, renderModifier: RenderControlAtPosition, contentPixelLength: number) : void
}

const renderModifiers : {[Char] : RenderModifier} = {
    "\x01": new TabRenderModifier(),
    "\x02": new AlignCenterRenderModifier()
};

function isControlCharacter(str : string) {
    "use strict";
    return renderModifiers[str];
}

module.exports =  {
    rastrify: function(text : string) : Bitmap {
        let arrayBuffer = new ArrayBuffer(128);
        let bitmap : Bitmap = new Uint8Array(arrayBuffer);
        let bitmapWithControlCharacters = rastrifyText(text, bitmap);
        return expandControlCharacters(bitmapWithControlCharacters);
    },
    _testing: {
        rastrifyText
    }
};

function expandControlCharacters(bitmapWithControlCharacters: BitmapWithControlCharacters) : Bitmap {
    "use strict";
    for (let renderControlAtPosition of bitmapWithControlCharacters.renderControls) {
        renderModifiers[renderControlAtPosition.character].render(bitmapWithControlCharacters.bitmap, renderControlAtPosition, bitmapWithControlCharacters.clip);
    }
    return bitmapWithControlCharacters.bitmap;
}

function rastrifyText(text : string, bitmap: Bitmap) : BitmapWithControlCharacters  {
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

    let glyphsCombinedWidth = glyphs.map(glyph => glyph.width).reduce((accumulator, currentValue, currentIndex, array) => {
        let controlCharacterAtPosition = controlCharacterMap.find(controlCharacterAtPosition => controlCharacterAtPosition.position === currentIndex);
        if (controlCharacterAtPosition) {
            renderControlsAtPositions.push({x: accumulator, character: controlCharacterAtPosition.character});
        }
        glyphsAtPosition.push({x: accumulator, glyph: glyphs[currentIndex]});
        let isLast = currentIndex >= array.length - 1;
        return accumulator + currentValue + (isLast ? 0 : 1);
    }, 0);

    glyphsAtPosition.forEach(glyphAtPosition => bitmap.set(glyphAtPosition.glyph.uint8Array, glyphAtPosition.x));

    return new BitmapWithControlCharacters(bitmap, renderControlsAtPositions, glyphsCombinedWidth);
}

type ControlCharacterAtPosition = {position: number, character: string};
type ControlCharacterMap = Array<ControlCharacterAtPosition>;
type GlyphAtPosition = {glyph: FontCharSpec, x: number};

