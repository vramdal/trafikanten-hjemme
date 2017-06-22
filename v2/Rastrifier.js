// @flow
const font = require("./font");
const BitmapWithControlCharacters = require("./BitmapWithControlCharacters");
import type {Bitmap, RenderControlAtPosition, RenderControlMap} from './BitmapWithControlCharacters';
import type {FontCharSpec} from './font';
import type {Char} from './SimpleTypes';
const TabRenderModifier = require("./rendermodifiers/AlignRightRenderModifier");
const AlignCenterRenderModifier = require("./rendermodifiers/AlignCenterRenderModifier");
const CutoffRenderModifier =  require("./rendermodifiers/CutoffRenderModifier");

export interface RenderModifier {
    render(bufferView: Uint8Array, renderControlAtPosition: RenderControlAtPosition, contentPixelLength: number) : void
}

type RenderModifierFactory = (parameters : ?string) => RenderModifier;

const renderModifiers : {[Char] : RenderModifierFactory} = {
    "\x01": () => new TabRenderModifier(),
    "\x02": () => new AlignCenterRenderModifier(),
    "\x11": (parameters) => {
        if (parameters) {
            return new CutoffRenderModifier((parameters: string).charCodeAt(0))
        } else {
            throw new Error("Missing parameters");
        }
    }
};

/**
 * Returns the number of characters that should be parsed as a control character sequence,
 * or <code>falsey</code> if {@link ch} is not a control character
 * @param ch
 * @returns {*|number}
 */
function isControlSequenceStart(ch : Char) {
    "use strict";
    return renderModifiers[ch] && (ch.charCodeAt(0) >>> 4) + 1;
}

module.exports =  {
    rastrify: function(text : string) : Bitmap {
        let arrayBuffer = new ArrayBuffer(128);
        let bitmap : Bitmap = new Uint8Array(arrayBuffer);
        let bitmapWithControlCharacters = rastrifyText(text, bitmap);
        return expandControlCharacters(bitmapWithControlCharacters);
    },
    _testing: {
        rastrifyText, isControlSequenceStart
    }
};

function expandControlCharacters(bitmapWithControlCharacters: BitmapWithControlCharacters) : Bitmap {
    "use strict";
    for (let renderControlAtPosition of bitmapWithControlCharacters.renderControls) {
        let renderModifierFactory : RenderModifierFactory = renderModifiers[renderControlAtPosition.character];
        let renderModifier : RenderModifier = renderModifierFactory(renderControlAtPosition.parameters);
        renderModifier.render(bitmapWithControlCharacters.bitmap, renderControlAtPosition, bitmapWithControlCharacters.clip);
    }
    return bitmapWithControlCharacters.bitmap;
}

function rastrifyText(text : string, bitmap: Bitmap) : BitmapWithControlCharacters  {
    "use strict";
    let glyphs : Array<FontCharSpec> = [];
    let controlCharacterMap : ControlCharacterMap = [];
    let plainText = "";
    let chIdx = 0;
    while (chIdx < text.length) {
        let ch : Char = text[chIdx];
        let controlSequenceLength = isControlSequenceStart(ch);
        if (controlSequenceLength) {
            let controlCharacterAtPosition : ControlCharacterAtPosition =
                {position: chIdx, character: ch, parameters: text.substring(1, 1 + chIdx + controlSequenceLength)};
            controlCharacterMap.push(controlCharacterAtPosition);
            chIdx += controlSequenceLength;
        } else if (font[ch]) {
            glyphs.push(font[ch]);
            plainText += ch;
            chIdx++;
        } else {
            throw new Error(`Unsupported character at index ${chIdx}: ${ch}`);
        }
    }
    let renderControlsAtPositions : RenderControlMap = [];
    let glyphsAtPosition : Array<GlyphAtPosition> = [];

    let glyphsCombinedWidth = glyphs.map(glyph => glyph.width).reduce((accumulator, currentValue, currentIndex, array) => {
        let controlCharacterAtPosition = controlCharacterMap.find(controlCharacterAtPosition => controlCharacterAtPosition.position === currentIndex);
        if (controlCharacterAtPosition) {
            renderControlsAtPositions.push({x: accumulator, character: controlCharacterAtPosition.character, parameters: controlCharacterAtPosition.parameters});
        }
        glyphsAtPosition.push({x: accumulator, glyph: glyphs[currentIndex]});
        let isLast = currentIndex >= array.length - 1;
        return accumulator + currentValue + (isLast ? 0 : 1);
    }, 0);

    glyphsAtPosition.forEach(glyphAtPosition => bitmap.set(glyphAtPosition.glyph.uint8Array, glyphAtPosition.x));

    return new BitmapWithControlCharacters(bitmap, renderControlsAtPositions, glyphsCombinedWidth);
}

type ControlCharacterAtPosition = {position: number, character: Char, parameters: string};
type ControlCharacterMap = Array<ControlCharacterAtPosition>;
type GlyphAtPosition = {glyph: FontCharSpec, x: number};

