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
        let hex = Buffer.from(result).toString('hex');

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
            let result = Rastrifier.rastrify(message);
            let hex = Buffer.from(result).toString('hex');
            //console.log(hex);
            expect(bitmapTo8Lines(result)).to.equal(expectedResult);
            expect(result[125]).to.equal(0x7a);
            expect(result[126]).to.equal(0x00);
            expect(result[127]).to.equal(0x00);
        });
        /*
         it('should cut the left part when there\'s not enough space', () => {
         "use strict";
         let message = "So long and thanks for all the\tfish";
         let result = Rastrifier.rastrify(message);
         bitmapTo8Lines(result);
         });
         */
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
            let result = Rastrifier.rastrify(message);
            expect(bitmapTo8Lines(result)).to.equal(expectedResult);
        });
    });
    describe('cutoff', () => {
        it('should cut off a message after a number of pixels', () => {
            let expectedResult = `································································································································
█···█·······██··██··············································································································
█···█··███···█···█···███······█···█··███························································································
█████·█···█··█···█··█···█·····█···█·█···························································································
█···█·█████··█···█··█···█·····█·█·█·█···························································································
█···█·█······█···█··█···█·····█·█·█·█···························································································
█···█··███··███·███··███·······█·█···███························································································
································································································································`;
           let message = "\x11\50Hello world!";
           let result = Rastrifier.rastrify(message);
           expect(bitmapTo8Lines(result)).to.equal(expectedResult);
        });
    });

    describe('isControlSequenceStart', () => {
        describe('how it decides how many characters a renderModifier specification takes', () => {
            it('should return 0 when first nibble is 0', () => {
               expect(Rastrifier._testing.isControlSequenceStart("\x01")).to.equal(1);
            });
            it('should return 1 when first nibble is 1', () => {
                expect(Rastrifier._testing.isControlSequenceStart("\x11")).to.equal(2);
            });
            it('should return undefined when on unsupported control character', () => {
                expect(Rastrifier._testing.isControlSequenceStart("\x09")).to.equal(undefined);
            });
        });
    });
});
