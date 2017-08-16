// @flow

import type {CharacterProcessor} from "./CharacterProcessor";
import type {FontCharSpec, FontMap} from "../font";
import type {AnnotatedBitmap} from "../Bitmap";

const FontCharacterAnnotation = require("./FontCharacterAnnotation.js");


type GlyphAtPosition = {glyph: FontCharSpec, x: number};


class FontCharacterProcessor implements CharacterProcessor {
    glyphs : Array<?FontCharSpec>;
    glyphsAtPosition : Array<GlyphAtPosition>;
    _font: FontMap;

    constructor(font : FontMap) {
        this._font = font;
        this.glyphs = [];
        this.glyphsAtPosition = [];
    }

    processCharacter(text : string, chIdx : number) : Array<any> {
        let ch = text[chIdx];
        let glyph = this._font[ch] ||
            this._font[ch.charCodeAt(0)] && typeof this._font[ch.charCodeAt(0)].char === "number" && this._font[ch.charCodeAt(0)];
        if (glyph) {
            this.glyphs.push(glyph);
            return [glyph];
        } else {
            this.glyphs.push(null);
        }
        return [];
    }

    mapCharacterToPosition(chIdx : number, x : number) {
        const fontCharSpec = this.glyphs[chIdx];
        if (fontCharSpec) {
            this.glyphsAtPosition.push({x: x, glyph: fontCharSpec});
        }
    }

    //noinspection JSUnusedGlobalSymbols
    place(bitmap : AnnotatedBitmap) : void {
        let annotations : Array<FontCharacterAnnotation> = [];
        let str = "";
        this.glyphsAtPosition.forEach((glyphAtPosition, idx) => {
            console.log("idx = ", idx);
            let char = glyphAtPosition.glyph.char;
            str += char;
            annotations.push(new FontCharacterAnnotation(glyphAtPosition.x, glyphAtPosition.x + glyphAtPosition.glyph.width, char, idx));
            bitmap.set(glyphAtPosition.glyph.uint8Array, glyphAtPosition.x);
        });
        bitmap.annotations = bitmap.annotations.concat(annotations);
    }

}

module.exports = FontCharacterProcessor;