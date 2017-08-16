// @flow
const expect = require("chai").expect;

const FontCharacterProcessor = require("./FontCharacterProcessor.js");
const font = require("../font");
const bitmapTo8Lines = require('../BitmapUtil').bitmapTo8Lines;

describe('FontCharacterProcessor', () => {

    let fcp;

    beforeEach(() => {
        fcp = new FontCharacterProcessor(font);
    });

    describe('processCharacter', () => {

        it('should store supported characters', () => {
            const glyphs = fcp.processCharacter("a", 0);
            expect(glyphs).to.have.lengthOf(1);
            let character = "a";
            expect(glyphs[0].char).to.eql(character);
            expect(glyphs[0].width).to.eql(font.bytes[character].length);
            expect(fcp.glyphs).to.have.lengthOf(1);
            expect(fcp.glyphs[0]).to.eql(font[(character : any)]);
        });

        it('should not store unsupported characters', () => {
            const glyphs = fcp.processCharacter("\n", 0);
            expect(glyphs).to.have.lengthOf(0);
            expect(fcp.glyphs).to.have.lengthOf(1);
            expect(fcp.glyphs[0]).to.equal(null);
        });

        it('should store supported characters in a mixed string', () => {
            let string = "a\nb\nc";
            let glyphs = [];
            for (let i = 0; i < string.length; i++) {
                glyphs.push(fcp.processCharacter(string, i));
            }
            expect(glyphs).to.have.lengthOf(5);
            expect(glyphs).to.eql([[font[("a" : any)]], [], [font[("b" : any)]], [], [font[("c" : any)]]]);
            expect(fcp.glyphs).to.have.lengthOf(5);
            expect(fcp.glyphs).to.eql([font[("a" : any)], null, font[("b" : any)], null, font[("c" : any)]])
        });
    });

    describe('mapCharacterToPosition', () => {

        beforeEach(() => {
            fcp.glyphs = [font[("a" : any)], null, font[("b" : any)]];
        });

        it('should map characters to positions', () => {
            fcp.mapCharacterToPosition(0, 0);
            expect(fcp.glyphsAtPosition).to.have.lengthOf(1);
            expect(fcp.glyphsAtPosition[0]).to.eql({x : 0, glyph: fcp.glyphs[0]});
            fcp.mapCharacterToPosition(1, 10);
            expect(fcp.glyphsAtPosition).to.have.lengthOf(1);
            fcp.mapCharacterToPosition(2, 10);
            expect(fcp.glyphsAtPosition).to.have.lengthOf(2);
            expect(fcp.glyphsAtPosition[1]).to.eql({x : 10, glyph: fcp.glyphs[2]});
        });
    });

    describe('place', () => {

        let bitmap : any;

        beforeEach(() => {
            fcp.glyphsAtPosition = [{x : 0, glyph: font[("a" : any)]}, {x : 10, glyph: font[("b" : any)]}];
            let arrayBuffer = new ArrayBuffer(20);
            let aBitmap : any = new Uint8Array(arrayBuffer);
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
            expect(bitmapTo8Lines(bitmap)).to.eql(expectedResult);
            expect(bitmap.annotations).to.have.lengthOf(2);
        });

    });


});