// @flow

import type {CharacterProcessor} from "./CharacterProcessor";
import type {FontCharSpec, FontMap} from "../font";
import type {Bitmap} from "../Bitmap";

type GlyphAtPosition = {glyph: FontCharSpec, x: number};


class FontCharacterProcessor implements CharacterProcessor {
    glyphs : Array<FontCharSpec>;
    glyphsAtPosition : Array<GlyphAtPosition>;
    _font: FontMap;

    constructor(font : FontMap) {
        this._font = font;
        this.glyphs = [];
        this.glyphsAtPosition = [];
    }

    processCharacter(text : string, chIdx : number) : number {
        let ch = text[chIdx];
        if (this._font[ch]) {
            this.glyphs.push(this._font[ch]);
            return 1;
        }
        return 0;
    }

    mapCharacterToPosition(chIdx : number, x : number) {
        this.glyphsAtPosition.push({x: x, glyph: this.glyphs[chIdx]});
    }

    //noinspection JSUnusedGlobalSymbols
    place(bitmap : Bitmap) {
        this.glyphsAtPosition.forEach(glyphAtPosition => bitmap.set(glyphAtPosition.glyph.uint8Array, glyphAtPosition.x));
    }

}

module.exports = FontCharacterProcessor;