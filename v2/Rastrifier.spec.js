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
        let hex = Buffer.from(result).toString('hex');

        expect(result[0]).to.equal(0x7e);
        expect(bitmapTo8Lines(result)).to.equal(expectedResult);
    });

    it('should expand a \t tab', () => {
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
        let message = "Hello\tworld!";
        let result = Rastrifier.rastrify(message);
        let hex = Buffer.from(result).toString('hex');
        //console.log(hex);
        expect(bitmapTo8Lines(result)).to.equal(expectedResult);
        expect(result[125]).to.equal(0x7a);
        expect(result[126]).to.equal(0x00);
        expect(result[127]).to.equal(0x00);
    });
    it('should center text following a \01', () => {
        let message = "\01Hello world!";
        let result = Rastrifier.rastrify(message);
        bitmapTo8Lines(result);
    });
});