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
        expect(result[0]).to.equal(0x7e);
        expect(bitmapTo8Lines(result)).to.equal(expectedResult);
    });
});
