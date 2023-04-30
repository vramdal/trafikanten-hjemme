const BitmapClipped = require("./Bitmap").BitmapClipped;

const MultilineBitmap = require("./Bitmap").MultilineBitmap;

describe("BitmapClipped", () => {

    describe('clip', () => {
        const bitmap = new Uint8Array([23, 31, 0, 28, 0, 0]);

        it('should use the passed value for graphicLength', () => {
            let bitmapWithControlCharacters = new BitmapClipped(bitmap, 2);
            expect(bitmapWithControlCharacters.clip).toEqual(2);
        });

        it('should use the value 0 when passed for graphicLength', () => {
            let bitmapWithControlCharacters = new BitmapClipped(bitmap, 0);
            expect(bitmapWithControlCharacters.clip).toEqual(0);
        });

        it('should infer graphicLength when omitted', () => {
            let bitmapWithControlCharacters = new BitmapClipped(bitmap);
            expect(bitmapWithControlCharacters.clip).toEqual(4);
        });

        it('should use the bitmap\'s length when passed false', () => {
            let bitmapWithControlCharacters = new BitmapClipped(bitmap, false);
            expect(bitmapWithControlCharacters.clip).toEqual(bitmap.length);
        });
    });
});

describe('MultilineBitmap', () => {
    describe('getByteStack', () => {
        it('should return a single number comprised of the byte at position x on all lines', () => {
            let line1 = [0b00000001, 0b00000010, 0b00000011];
            let line2 = [0b01000001, 0b01000010, 0b01000011];
            let line3 = [0b10000001, 0b10000010, 0b10000011];
            let multilineBitmap = new MultilineBitmap(line1, line2, line3);
            expect(multilineBitmap.getByteStack(0)).toEqual(parseInt("00000001" + "01000001" + "10000001", 2));
            expect(multilineBitmap.getByteStack(1)).toEqual(parseInt("00000010" + "01000010" + "10000010", 2));
            expect(multilineBitmap.getByteStack(2)).toEqual(parseInt("00000011" + "01000011" + "10000011", 2));
        });

        it('should return a single number comprised of the byte at position x on all lines, with y 0-bits inserted between each byte', () => {
            let line1 = [0b00000001, 0b00000010, 0b00000011];
            let line2 = [0b01000001, 0b01000010, 0b01000011];
            let line3 = [0b10000001, 0b10000010, 0b10000011];
            let multilineBitmap = new MultilineBitmap(line1, line2, line3);
            expect(multilineBitmap.getByteStack(0, 2)).toEqual(parseInt("00000001" + "00" + "01000001" + "00" + "10000001", 2));
            expect(multilineBitmap.getByteStack(1, 2)).toEqual(parseInt("00000010" + "00" + "01000010" + "00" + "10000010", 2));
            expect(multilineBitmap.getByteStack(2, 2)).toEqual(parseInt("00000011" + "00" + "01000011" + "00" + "10000011", 2));
        });
    });
});
