import FontCharacterProcessor from "./FontCharacterProcessor";

import font from "./font";

import { bitmapTo8Lines } from "../bitmap/BitmapUtil";

describe('FontCharacterProcessor', () => {

  let fcp;

  beforeEach(() => {
    fcp = new FontCharacterProcessor(font);
  });

  describe('processCharacter', () => {

    it('should store supported characters', () => {
      const glyphs = fcp.processCharacter("a", 0);
      expect(glyphs).toHaveLength(1);
      let character = "a";
      expect(glyphs[0].char).toEqual(character);
      expect(glyphs[0].width).toEqual(font.bytes[character].length);
      expect(fcp.glyphs).toHaveLength(1);
      expect(fcp.glyphs[0]).toEqual(font[(character)]);
    });

    it('should not store unsupported characters', () => {
      const glyphs = fcp.processCharacter("\n", 0);
      expect(glyphs).toHaveLength(0);
      expect(fcp.glyphs).toHaveLength(1);
      expect(fcp.glyphs[0]).toEqual(null);
    });

    it('should store supported characters in a mixed string', () => {
      let string = "a\nb\nc";
      let glyphs = [];
      for (let i = 0; i < string.length; i++) {
        glyphs.push(fcp.processCharacter(string, i));
      }
      expect(glyphs).toHaveLength(5);
      expect(glyphs).toEqual([[font[("a")]], [], [font[("b")]], [], [font[("c")]]]);
      expect(fcp.glyphs).toHaveLength(5);
      expect(fcp.glyphs).toEqual([font[("a")], null, font[("b")], null, font[("c")]])
    });
  });

  describe('mapCharacterToPosition', () => {

    beforeEach(() => {
      fcp.glyphs = [font[("a")], null, font[("b")]];
    });

    it('should map characters to positions', () => {
      fcp.mapCharacterToPosition(0, 0);
      expect(fcp.glyphsAtPosition).toHaveLength(1);
      expect(fcp.glyphsAtPosition[0]).toEqual({x: 0, glyph: fcp.glyphs[0]});
      fcp.mapCharacterToPosition(1, 10);
      expect(fcp.glyphsAtPosition).toHaveLength(1);
      fcp.mapCharacterToPosition(2, 10);
      expect(fcp.glyphsAtPosition).toHaveLength(2);
      expect(fcp.glyphsAtPosition[1]).toEqual({x: 10, glyph: fcp.glyphs[2]});
    });
  });

  describe('place', () => {

    let bitmap: any;

    beforeEach(() => {
      fcp.glyphsAtPosition = [{x: 0, glyph: font[("a")]},{x : 10, glyph:font[("b")]}];
      let aBitmap: any = new Uint8Array(new ArrayBuffer(20));
      aBitmap.annotations = [];
      aBitmap.sourceString = "a\nb";
      bitmap = aBitmap;
    });

    it('should place characters on the bitmap', () => {
      fcp.place(bitmap);
      let expectedResult = `····················
··········█·········
·███······█·········
····█·····███·······
·████·····█··█······
█···█·····█··█······
█████·····███·······
····················`;
      expect(bitmapTo8Lines(bitmap)).toEqual(expectedResult);
      expect(bitmap.annotations).toHaveLength(2);
    });

  });


});
