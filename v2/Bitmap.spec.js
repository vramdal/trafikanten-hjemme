let expect = require("chai").expect;

const BitmapWithControlCharacters = require("./Bitmap");

describe("BitmapClipped", () => {

    describe('clip', () => {
        const bitmap = new Uint8Array([23, 31, 0, 28, 0, 0]);

        it('should use the passed value for graphicLength', () => {
            let bitmapWithControlCharacters = new BitmapWithControlCharacters(bitmap, 2);
            expect(bitmapWithControlCharacters.clip).to.equal(2);
        });

        it('should use the value 0 when passed for graphicLength', () => {
            let bitmapWithControlCharacters = new BitmapWithControlCharacters(bitmap, 0);
            expect(bitmapWithControlCharacters.clip).to.equal(0);
        });

        it('should infer graphicLength when omitted', () => {
            let bitmapWithControlCharacters = new BitmapWithControlCharacters(bitmap);
            expect(bitmapWithControlCharacters.clip).to.equal(4);
        });

        it('should use the bitmap\'s length when passed false', () => {
            let bitmapWithControlCharacters = new BitmapWithControlCharacters(bitmap, false);
            expect(bitmapWithControlCharacters.clip).to.equal(bitmap.length);
        });
    });
});