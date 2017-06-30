// @flow
const font = require("./font");
const BitmapWithControlCharacters = require("./BitmapWithControlCharacters");
const FontCharacterProcessor = require("./rendering/FontCharacterProcessor.js");
const ControlCharacterProcessor = require("./rendering/ControlCharacterProcessor.js");
import type {Bitmap} from './BitmapWithControlCharacters';
import type {CharacterProcessor} from "./rendering/CharacterProcessor";

function parseString(text, characterProcessors) {
    // TODO: Need to do this once per frame
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

function mapCharactersToPositions(glyphs, characterProcessors) : number {
    return glyphs.map(glyph => glyph.width).reduce((accumulator, currentValue, currentIndex, array) => {
        for (let characterProcessor of characterProcessors) {
            characterProcessor.mapCharacterToPosition(currentIndex, accumulator);
        }
        let isLast = currentIndex >= array.length - 1;
        return accumulator + currentValue + (isLast ? 0 : 1);
    }, 0);
}

function rastrifyText(text : string, frameWidth : number) : Bitmap  {
    "use strict";

    let controlCharacterProcessor = new ControlCharacterProcessor();
    let fontCharacterProcessor = new FontCharacterProcessor(font);
    let characterProcessors : Array<CharacterProcessor> = [fontCharacterProcessor, controlCharacterProcessor];
    parseString(text, characterProcessors);

    let glyphs = fontCharacterProcessor.glyphs;
    let glyphsCombinedWidth = mapCharactersToPositions(glyphs, characterProcessors);

    let arrayBuffer = new ArrayBuffer(Math.max(glyphsCombinedWidth, frameWidth));
    let bitmap : Bitmap = new Uint8Array(arrayBuffer);

    for (let characterProcessor of characterProcessors) {
        characterProcessor.place(bitmap, glyphsCombinedWidth);
    }
    return bitmap;
}

module.exports =  {
    rastrify: function(text : string, frameWidth: number = 128) : Array<Bitmap> {
        let bitmapWithControlCharacters = rastrifyText(text, frameWidth);
        return [bitmapWithControlCharacters];
        //return expandControlCharacters(bitmapWithControlCharacters);
    },
    _testing: {
        rastrifyText, isControlSequenceStart : ControlCharacterProcessor._isControlSequenceStart
    }
};
