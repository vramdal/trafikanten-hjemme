// @flow

import type {CharacterProcessor} from "./CharacterProcessor";
import type {FontCharSpec, FontMap} from "../font";
import type {AnnotatedBitmap} from "../Bitmap";

const FontCharacterAnnotation = require("./FontCharacterAnnotation.js");


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
        let glyph = this._font[ch] ||
            this._font[ch.charCodeAt(0)] && typeof this._font[ch.charCodeAt(0)].char === "number" && this._font[ch.charCodeAt(0)];
        if (glyph) {
            this.glyphs.push(glyph);
            return 1;
        }
        return 0;
    }

    mapCharacterToPosition(chIdx : number, x : number) {
        this.glyphsAtPosition.push({x: x, glyph: this.glyphs[chIdx]});
    }

    //noinspection JSUnusedGlobalSymbols
    place(bitmap : AnnotatedBitmap) : void {
        let annotations : Array<FontCharacterAnnotation> = [];
        let str = "";
        this.glyphsAtPosition.forEach((glyphAtPosition, idx) => {
            let char = glyphAtPosition.glyph.char;
            str += char;
            annotations.push(new FontCharacterAnnotation(glyphAtPosition.x, glyphAtPosition.x + glyphAtPosition.glyph.width, char, idx));
            bitmap.set(glyphAtPosition.glyph.uint8Array, glyphAtPosition.x);
        });
        bitmap.annotations = bitmap.annotations.concat(annotations);
    }

}

module.exports = FontCharacterProcessor;