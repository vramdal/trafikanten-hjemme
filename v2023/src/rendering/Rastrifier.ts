import type { FontCharSpec } from "./font";
import font from "./font";
import type { AnnotatedBitmap } from '../bitmap/Bitmap';
import type { CharacterProcessor } from "./CharacterProcessor";
import FontCharacterProcessor from "./FontCharacterProcessor";
import SoftLinebreakingCharacterProcessor from "./SoftLinebreakingCharacterProcessor";
import HardLinebreakingCharacterProcessor from "./HardLinebreakingCharacterProcessor";

function parseString(text: string, characterProcessors: Array<CharacterProcessor>): Array<FontCharSpec | undefined> {
  let glyphs: Array<FontCharSpec | undefined> = [];
  for (let chIdx = 0; chIdx < text.length;) {
    let position = chIdx;
    for (let cpIdx = 0; chIdx === position && cpIdx < characterProcessors.length; cpIdx++) {
      let characterProcessor = characterProcessors[cpIdx];
      const theseGlyphs = characterProcessor.processCharacter(text, chIdx);
      glyphs = glyphs.concat(theseGlyphs);
      chIdx += theseGlyphs.length;
    }
    let notProcessed = position === chIdx;
    if (notProcessed) {
      throw new Error(`Unsupported character ${text[position]} (charcode ${text.charCodeAt(position)}) at index ${position} in string "${text}"`);
    }
  }
  return glyphs;
}

function mapCharactersToPositions(glyphs: Array<FontCharSpec | undefined>, characterProcessors): number {
  return glyphs.reduce((accumulator: number, glyph: FontCharSpec | undefined, currentIndex: number, glyphs: Array<FontCharSpec | undefined>) => {
    let advanceCursor = 0;
    for (let characterProcessor of characterProcessors) {
      advanceCursor += characterProcessor.mapCharacterToPosition(currentIndex, accumulator);
    }
    let isLast = currentIndex >= glyphs.length - 1;
    let spacing = glyph && glyph.width || 0 > 0 && !isLast ? advanceCursor : 0;
    return accumulator + (glyph && glyph.width) + spacing;
  }, 0);
}

function rastrifyFrame(text: string): AnnotatedBitmap {
  "use strict";

  let fontCharacterProcessor = new FontCharacterProcessor(font);
  let softLinebreakingCharacterProcessor = new SoftLinebreakingCharacterProcessor();
  let hardLinebreakingCharacterProcessor = new HardLinebreakingCharacterProcessor();
  let characterProcessors: Array<CharacterProcessor> = [hardLinebreakingCharacterProcessor, softLinebreakingCharacterProcessor, fontCharacterProcessor];
  let glyphs = parseString(text, characterProcessors);

  let glyphsCombinedWidth = mapCharactersToPositions(glyphs, characterProcessors);

  let arrayBuffer = new ArrayBuffer(glyphsCombinedWidth);
  let bitmap: any = new Uint8Array(arrayBuffer);
  bitmap.annotations = [];
  bitmap.sourceString = text;
  for (let characterProcessor of characterProcessors) {
    characterProcessor.place(bitmap, glyphsCombinedWidth);
  }
  bitmap.annotations.sort((ann1, ann2) => ann1.start - ann2.start);
  return bitmap;
}

module.exports = {
  rastrify: function (text: string): AnnotatedBitmap {
    return rastrifyFrame(text);
  },
  _testing: {
    rastrifyFrame, parseString
  }
};
export const _testing = {
  rastrifyFrame, parseString
}

export function rastrify(text: string): AnnotatedBitmap {
  return rastrifyFrame(text);
}
