let expect = require("chai").expect;

let Rastrifier = require('./Rastrifier');

const bitmapTo8Lines = require('./BitmapUtil').bitmapTo8Lines;
const printRuler = require('./BitmapUtil').printRuler;

describe('Rastrifier', () => {

    beforeEach(() => {
        "use strict";
        printRuler();
    });

    it('should raster a simple message', () => {
        let expectedResult = `································································································································
█···█·······██··██·····························██·····█···█·····································································
█···█··███···█···█···███······█···█··███··█·██··█·····█···█·····································································
█████·█···█··█···█··█···█·····█···█·█···█·██····█···███···█·····································································
█···█·█████··█···█··█···█·····█·█·█·█···█·█·····█··█··█···█·····································································
█···█·█······█···█··█···█·····█·█·█·█···█·█·····█··█··█·········································································
█···█··███··███·███··███·······█·█···███··█····███··███···█·····································································
································································································································`;
        let message = "Hello world!";
        let result = Rastrifier.rastrify(message);
        expect(result[0]).to.equal(0x7e);
        expect(bitmapTo8Lines(result)).to.equal(expectedResult);
    });

    describe("alignment", () => {
        it('should right-align text after a \t', () => {
            let expectedResult =
                `································································································································
█···█·······██··██································································································██·····█···█··
█···█··███···█···█···███·········································································█···█··███··█·██··█·····█···█··
█████·█···█··█···█··█···█········································································█···█·█···█·██····█···███···█··
█···█·█████··█···█··█···█········································································█·█·█·█···█·█·····█··█··█···█··
█···█·█······█···█··█···█········································································█·█·█·█···█·█·····█··█··█······
█···█··███··███·███··███··········································································█·█···███··█····███··███···█··
································································································································`;
            "use strict";
            let message = "Hello\x01world!";
            let result = Rastrifier.rastrify(message, 128);
            let hex = Buffer.from(result).toString('hex');
            //console.log(hex);
            expect(bitmapTo8Lines(result)).to.equal(expectedResult);
            expect(result[125]).to.equal(0x7a);
            expect(result[126]).to.equal(0x00);
            expect(result[127]).to.equal(0x00);
        });
        it('should center a short message', () => {
            "use strict";
            let expectedResult =
                `································································································································
·································█···█·······██··██·····························██·····█···█····································
·································█···█··███···█···█···███······█···█··███··█·██··█·····█···█····································
·································█████·█···█··█···█··█···█·····█···█·█···█·██····█···███···█····································
·································█···█·█████··█···█··█···█·····█·█·█·█···█·█·····█··█··█···█····································
·································█···█·█······█···█··█···█·····█·█·█·█···█·█·····█··█··█········································
·································█···█··███··███·███··███·······█·█···███··█····███··███···█····································
································································································································`;
            let message =  "\x02Hello world!";
            let result = Rastrifier.rastrify(message, 128);
            expect(bitmapTo8Lines(result)).to.equal(expectedResult);
        });
    });

    describe('isControlSequenceStart', () => {
        describe('how it decides how many characters a renderModifier specification takes', () => {
            it('should return 0 when first nibble is 0', () => {
               expect(Rastrifier._testing.isControlSequenceStart("\x01")).to.equal(1);
            });
/*
            it('should return 1 when first nibble is 1', () => {
                expect(Rastrifier._testing.isControlSequenceStart("\x11")).to.equal(2);
            });
*/
            it('should return undefined when on unsupported control character', () => {
                expect(Rastrifier._testing.isControlSequenceStart("\x09")).to.equal(undefined);
            });
        });
    });
});
