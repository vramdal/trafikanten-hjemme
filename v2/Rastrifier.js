// @flow
const font = require("./font");
const BitmapWithControlCharacters = require("./BitmapWithControlCharacters");
import type {Bitmap, RenderControlAtPosition, RenderControlMap} from './BitmapWithControlCharacters';
import type {FontCharSpec} from './font';
import type {Char} from './SimpleTypes';
const TabRenderModifier = require("./rendermodifiers/AlignRightRenderModifier");
const AlignCenterRenderModifier = require("./rendermodifiers/AlignCenterRenderModifier");

export interface RenderModifier {
    render(bufferView: Uint8Array, renderControlAtPosition: RenderControlAtPosition, contentPixelLength: number) : void
}

type RenderModifierFactory = (parameters : ?string) => RenderModifier;

const renderModifiers : {[Char] : RenderModifierFactory} = {
    "\x01": () => new TabRenderModifier(),
    "\x02": () => new AlignCenterRenderModifier()
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
    rastrify: function(text : string, frameWidth: number) : Array<Bitmap> {
        let bitmapWithControlCharacters = rastrifyText(text, frameWidth);
        return expandControlCharacters(bitmapWithControlCharacters);
    },
    _testing: {
        rastrifyText, isControlSequenceStart
    }
};

function expandControlCharacters(bitmapWithControlCharacters: BitmapWithControlCharacters) : Array<Bitmap> {
    "use strict";
    for (let renderControlAtPosition of bitmapWithControlCharacters.renderControls) {
        let renderModifierFactory : RenderModifierFactory = renderModifiers[renderControlAtPosition.character];
        let renderModifier : RenderModifier = renderModifierFactory(renderControlAtPosition.parameters);
        renderModifier.render(bitmapWithControlCharacters.bitmap, renderControlAtPosition, bitmapWithControlCharacters.clip);
    }
    return [bitmapWithControlCharacters.bitmap];
}

class ControlCharacterProcessor implements CharacterProcessor {

    controlCharacterMap : ControlCharacterMap;
    renderControlsAtPositions: RenderControlMap;

    constructor() {
        this.controlCharacterMap = [];
        this.renderControlsAtPositions = [];
    }

    processCharacter(text : string, chIdx : number) : number {
        "use strict";
        let ch: Char = text[chIdx];
        let controlSequenceLength = isControlSequenceStart(ch);
        if (controlSequenceLength) {
            let controlCharacterAtPosition: ControlCharacterAtPosition =
                {position: chIdx, character: ch, parameters: text.substring(1, 1 + chIdx + controlSequenceLength)};
            this.controlCharacterMap.push(controlCharacterAtPosition);
            return controlSequenceLength;
        }
        return 0;
    }

    mapCharacterToPosition(chIdx, x) {
        let controlCharacterAtPosition = this.controlCharacterMap.find(controlCharacterAtPosition => controlCharacterAtPosition.position === chIdx);
        if (controlCharacterAtPosition) {
            this.renderControlsAtPositions.push({
                x: x,
                character: controlCharacterAtPosition.character,
                parameters: controlCharacterAtPosition.parameters
            });
        }
    }

}

class FontCharacterProcessor implements CharacterProcessor {
    glyphs : Array<FontCharSpec>;
    glyphsAtPosition : Array<GlyphAtPosition>;

    constructor() {
        this.glyphs = [];
        this.glyphsAtPosition = [];
    }

    processCharacter(text : string, chIdx : number) : number {
        let ch = text[chIdx];
        if (font[ch]) {
            this.glyphs.push(font[ch]);
            return 1;
        }
        return 0;
    }

    mapCharacterToPosition(chIdx, x) {
        this.glyphsAtPosition.push({x: x, glyph: this.glyphs[chIdx]});

    }

}

function parseString(text, characterProcessors) {
    for (let chIdx = 0; chIdx < text.length;) {
        let position = chIdx;
        for (let cpIdx = 0; chIdx === position && cpIdx < characterProcessors.length; cpIdx++) {
            let characterProcessor = characterProcessors[cpIdx];
            chIdx += characterProcessor.processCharacter(text, chIdx);
        }
        let notProcessed = position === chIdx;
        if (notProcessed) {
            throw new Error(`Unsupported character ${text[position]} at index ${position} in string "${text}"`);
        }
    }
}

function rastrifyText(text : string, frameWidth : number) : BitmapWithControlCharacters  {
    "use strict";

    let controlCharacterProcessor = new ControlCharacterProcessor();
    let fontCharacterProcessor = new FontCharacterProcessor();
    let characterProcessors : Array<CharacterProcessor> = [controlCharacterProcessor, fontCharacterProcessor];
    parseString(text, characterProcessors);

    let glyphs = fontCharacterProcessor.glyphs;

    let glyphsCombinedWidth = glyphs.map(glyph => glyph.width).reduce((accumulator, currentValue, currentIndex, array) => {
        for (let characterProcessor of characterProcessors) {
            characterProcessor.mapCharacterToPosition(currentIndex, accumulator);
        }
        let isLast = currentIndex >= array.length - 1;
        return accumulator + currentValue + (isLast ? 0 : 1);
    }, 0);

    let glyphsAtPosition = fontCharacterProcessor.glyphsAtPosition;
    let renderControlsAtPositions : RenderControlMap = controlCharacterProcessor.renderControlsAtPositions;

    let arrayBuffer = new ArrayBuffer(Math.max(glyphsCombinedWidth, frameWidth));
    let bitmap : Bitmap = new Uint8Array(arrayBuffer);

    glyphsAtPosition.forEach(glyphAtPosition => bitmap.set(glyphAtPosition.glyph.uint8Array, glyphAtPosition.x));

    return new BitmapWithControlCharacters(bitmap, renderControlsAtPositions, glyphsCombinedWidth);
}

type ControlCharacterAtPosition = {position: number, character: Char, parameters: string};
type ControlCharacterMap = Array<ControlCharacterAtPosition>;
type GlyphAtPosition = {glyph: FontCharSpec, x: number};

interface CharacterProcessor {

    processCharacter(fullString : string, chIdx : number) : number;
    mapCharacterToPosition(chIdx : number, x: number) : void;

}