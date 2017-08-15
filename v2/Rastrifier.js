// @flow
const font = require("./font");
const FontCharacterProcessor = require("./rendering/FontCharacterProcessor.js");
const SoftLinebreakingCharacterProcessor = require("./rendering/SoftLinebreakingCharacterProcessor.js");
const HardLinebreakingCharacterProcessor = require("./rendering/HardLinebreakingCharacterProcessor.js");
const SimpleTypes = require("./SimpleTypes.js");
import type {AnnotatedBitmap} from './Bitmap';
import type {CharacterProcessor} from "./rendering/CharacterProcessor";

function parseString(text : string, characterProcessors : Array<CharacterProcessor>) {
    for (let chIdx = 0; chIdx < text.length;) {
        let position = chIdx;
        for (let cpIdx = 0; chIdx === position && cpIdx < characterProcessors.length; cpIdx++) {
            let characterProcessor = characterProcessors[cpIdx];
            chIdx += characterProcessor.processCharacter(text, chIdx);
        }
        let notProcessed = position === chIdx;
        if (notProcessed) {
            throw new Error(`Unsupported character ${text[position]} (charcode ${text.charCodeAt(position)}) at index ${position} in string "${text}"`);
        }
    }
}

function mapCharactersToPositions(glyphs, characterProcessors) : number {
    return glyphs.map(glyph => glyph.width).reduce((accumulator, currentValue, currentIndex, array) => {
        for (let characterProcessor of characterProcessors) {
            characterProcessor.mapCharacterToPosition(currentIndex, accumulator);
        }
        let isLast = currentIndex >= array.length - 1;
        return accumulator + currentValue + (isLast ? 0 : font.kerning(glyphs[currentIndex].char, glyphs[currentIndex + 1].char));
    }, 0);
}

function rastrifyFrame(text: string): AnnotatedBitmap {
    "use strict";

    let fontCharacterProcessor = new FontCharacterProcessor(font);
    let softLinebreakingCharacterProcessor = new SoftLinebreakingCharacterProcessor();
    let hardLinebreakingCharacterProcessor = new HardLinebreakingCharacterProcessor();
    let characterProcessors : Array<CharacterProcessor> = [hardLinebreakingCharacterProcessor, softLinebreakingCharacterProcessor, fontCharacterProcessor];
    parseString(text, characterProcessors);

    let glyphs = fontCharacterProcessor.glyphs; // TODO: Rewrite so that HardLinebreakingCharacterProcessor also can return 'glyphs' in sequence
    let glyphsCombinedWidth = mapCharactersToPositions(glyphs, characterProcessors);

    let arrayBuffer = new ArrayBuffer(glyphsCombinedWidth);
    let bitmap : any = new Uint8Array(arrayBuffer);
    bitmap.annotations = [];
    bitmap.sourceString = text;
    for (let characterProcessor of characterProcessors) {
        characterProcessor.place(bitmap, glyphsCombinedWidth);
    }
    bitmap.annotations.sort((ann1, ann2) => ann1.start - ann2.start);
    return bitmap;
}

module.exports =  {
    rastrify: function (text: string): AnnotatedBitmap {
        return rastrifyFrame(text);
    },
    _testing: {
        rastrifyFrame, parseString
    }
};
