let Rastrifier = require('./Rastrifier');

const bitmapTo8Lines = require('../bitmap/BitmapUtil').bitmapTo8Lines;
const printRuler = require('../bitmap/BitmapUtil').printRuler;

describe('Rastrifier', () => {

    beforeEach(() => {
        "use strict";
        printRuler();
    });

    it('should raster a simple message', () => {
        let expectedResult =
`·····························································
█···█·······██··██·····························██·····█···█··
█···█··███···█···█···███······█···█··███··█·██··█·····█···█··
█████·█···█··█···█··█···█·····█···█·█···█·██····█···███···█··
█···█·█████··█···█··█···█·····█·█·█·█···█·█·····█··█··█···█··
█···█·█······█···█··█···█·····█·█·█·█···█·█·····█··█··█······
█···█··███··███·███··███·······█·█···███··█····███··███···█··
·····························································`;
        let message = "Hello world!";
        let result = Rastrifier.rastrify(message);
        expect(result[0]).toEqual(0x7e);
        expect(bitmapTo8Lines(result)).toEqual(expectedResult);
    });

    describe('a case', () => {
        it('is a case', () => {
            let str = "a\nb\nc";
            const result = Rastrifier.rastrify(str);
            expect(result.annotations).toHaveLength(5);
        });

        it('should not create a space for hard linebreaks', () => {
            let str = "a\nb";
            const result = Rastrifier.rastrify(str);
            let expectedResult =
`·········
·····█···
·███·█···
····████·
·█████··█
█···██··█
████████·
·········`;
            expect(bitmapTo8Lines(result)).toEqual(expectedResult);
        });
    });

    describe('kerning', () => {
        it('should not add space between characters in a kerning pair', () => {
            let str = String.fromCharCode(9601) + String.fromCharCode(9602);
            const result = Rastrifier.rastrify(str);
            let expectedResult =
                `··
··
··
··
··
··
·█
██`;
            expect(bitmapTo8Lines(result)).toEqual(expectedResult);
            let str2 = "rad";
            const result2 = Rastrifier.rastrify(str2);
            let expectedResult2 =
                `··············
·············█
█·██·███·····█
██······█··███
█····████·█··█
█···█···█·█··█
█···█████··███
··············`;
            expect(bitmapTo8Lines(result2)).toEqual(expectedResult2);
        });
        it('should add space when only one of the characters is non kerning', () => {
            let str = "b" + String.fromCharCode(9601) + "a";
            const result = Rastrifier.rastrify(str);
            let expectedResult =
                `············
█···········
█·······███·
███········█
█··█····████
█··█···█···█
███····█████
·····█······`;
            expect(bitmapTo8Lines(result)).toEqual(expectedResult);
        });
        it('should not add space after the last character', () => {
            let str = "ab";
            const result = Rastrifier.rastrify(str);
            let expectedResult =
                `··········
······█···
·███··█···
····█·███·
·████·█··█
█···█·█··█
█████·███·
··········`;
            expect(bitmapTo8Lines(result)).toEqual(expectedResult);
        });
    });

});
