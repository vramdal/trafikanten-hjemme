const expect = require("chai").expect;
const bitmapTo8Lines = require('../bitmap/BitmapUtil').bitmapTo8Lines;
const numToPaddedHex = require('../bitmap/BitmapUtil').numToPaddedHex;
const getHexFingerprint = require('../bitmap/BitmapUtil').getHexFingerprint;
const printRuler = require('../bitmap/BitmapUtil').printRuler;
const Scrolling = require("../animations/Scrolling.js");
const BitmapProxy = require("../bitmap/BitmapProxy.js");


const FRAME_WIDTH = 128;

describe('Scrolling', () => {

    let animation;
    let target;

    const imageHex = "7e1010107e001c2a2a2a1800427e0200427e02001c2222221c00000000003c020c023c001c2222221c003e10202000427e02000c12127e0000007a000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000";
    const bitmap = Buffer.from(imageHex, "hex");


    beforeEach(() => {
        "use strict";
        animation = new Scrolling();

        target = new BitmapProxy(bitmap, FRAME_WIDTH, animation.getTranslated.bind(animation));
        printRuler();
    });

    it('should generate a hex fingerprint', () => {
        let image = `································································································································
··██··██·····························██·····█···█···············································································
···█···█···███······█···█··███··█·██··█·····█···█···············································································
█··█···█··█···█·····█···█·█···█·██····█···███···█···············································································
█··█···█··█···█·····█·█·█·█···█·█·····█··█··█···█···············································································
···█···█··█···█·····█·█·█·█···█·█·····█··█··█···················································································
··███·███··███·······█·█···███··█····███··███···█···············································································
································································································································`;
        const hexFingerprint = getHexFingerprint(image);
        console.log("hexFingerprint = ", hexFingerprint);
    });
    

    it('should scroll 10 + width left', () => {
        let expected = `································································································································
··██··██·····························██·····█···█···············································································
···█···█···███······█···█··███··█·██··█·····█···█···············································································
█··█···█··█···█·····█···█·█···█·██····█···███···█···············································································
█··█···█··█···█·····█·█·█·█···█·█·····█··█··█···█···············································································
···█···█··█···█·····█·█·█·█···█·█·····█··█··█···················································································
··███·███··███·······█·█···███··█····███··███···█···············································································
································································································································`;
        animation.setSource(bitmap, FRAME_WIDTH);
        animation.scroll(-10 - FRAME_WIDTH);
        expect(getHexFingerprint(bitmapTo8Lines(target))).to.equal(getHexFingerprint(expected));
    });
    it('should scroll right', () => {
        let expected = `································································································································
··········█···█·······██··██·····························██·····█···█···························································
··········█···█··███···█···█···███······█···█··███··█·██··█·····█···█···························································
··········█████·█···█··█···█··█···█·····█···█·█···█·██····█···███···█···························································
··········█···█·█████··█···█··█···█·····█·█·█·█···█·█·····█··█··█···█···························································
··········█···█·█······█···█··█···█·····█·█·█·█···█·█·····█··█··█·······························································
··········█···█··███··███·███··███·······█·█···███··█····███··███···█···························································
································································································································`;
        animation.setSource(bitmap, FRAME_WIDTH);
        animation.scroll(10 - FRAME_WIDTH);
        expect(getHexFingerprint(bitmapTo8Lines(target))).to.equal(getHexFingerprint(expected));
    });
    it('should have a blank screen when completed scrolling left', () => {
        animation.setSource(bitmap, FRAME_WIDTH);
        animation.scroll(-FRAME_WIDTH - bitmap.length);
        bitmapTo8Lines(target);
        expect(getHexFingerprint(bitmapTo8Lines(target))).to.equal("0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000");
    });
    it('should have a blank screen when completed scrolling right', () => {
        animation.setSource(bitmap, FRAME_WIDTH);
        animation.scroll(FRAME_WIDTH);
        expect(getHexFingerprint(bitmapTo8Lines(target))).to.equal("0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000");
        expect(target.length).to.equal(FRAME_WIDTH);
    });
    it('should fill with whitespace when the source is smaller than the frame', () => {
        let imageHex = "7e1010107e001c2a2a2a1800427e0200427e02001c2222221c00000000003c020c023c001c2222221c003e10202000427e02000c12127e0000007a";
        let bitmap = Buffer.from(imageHex, "hex");
        animation.setSource(bitmap, FRAME_WIDTH);
        animation.scroll(+1);
        expect(target.length).to.equal(FRAME_WIDTH);
    });
    it('should correctly report number of scrollable pixels remaining', () => {
        let imageHex = "7e1010107e001c2a2a2a1800427e0200427e02001c2222221c00000000003c020c023c001c2222221c003e10202000427e02000c12127e0000007a";
        let bitmap = Buffer.from(imageHex, "hex");
        animation.setSource(bitmap, FRAME_WIDTH);
        let startingRemainingScrollWidth = bitmap.length + FRAME_WIDTH;
        expect(animation.scrollWidth).to.equal(startingRemainingScrollWidth);
        expect(animation.remainingScrollWidth).to.equal(startingRemainingScrollWidth); // 315
        animation.scroll(-1);
        expect(animation._scrollOffset).to.equal(-1);
        expect(animation.remainingScrollWidth).to.equal(186);
        expect(animation.scrollWidth).to.equal(startingRemainingScrollWidth);
        animation.scroll(-314);
        expect(animation.remainingScrollWidth).to.equal(0);
        animation.scroll(-1);
        expect(animation.remainingScrollWidth).to.equal(0);
        expect(animation._scrollOffset).to.equal(-startingRemainingScrollWidth - FRAME_WIDTH) ;
    });
});

describe('getAdjustedByScrollOffset', () => {

    let animation;
    let target;

    function getOffsetArray(frameWidth) {
        let array = new Array(frameWidth);
        for (let i = 0; i < array.length; i++) {
            array[i] = animation.getTranslated(i);
        }
        return {array, hex: array.map(byte => numToPaddedHex(byte)).join("")};
    }

    let createBitmap = function (messageLength) {
        let imageHex = "";
        for (let i = 1; i < messageLength + 1; i++) {
            imageHex += numToPaddedHex(i);
        }
        return Buffer.from(imageHex, "hex");
    };

    let runTests = function (messageLength, frameWidth) {
        let expectedArray;
        let bitmap = createBitmap(messageLength);
        beforeEach(() => {
            "use strict";
            animation = new Scrolling();

            target = new BitmapProxy(bitmap, FRAME_WIDTH, animation.getTranslated.bind(animation));

            animation.setSource(bitmap, frameWidth);
            expectedArray = new Array(frameWidth).fill(0);
        });

        it('should display only padding when not scrolled', () => {
            "use strict";
            let result = getOffsetArray(frameWidth);
            expect(result.hex).to.equal(expectedArray.map(numToPaddedHex).join(""));
        });
        it('should start displaying content from the right when scrolling', () => {
            animation.scroll(-1);
            let result = getOffsetArray(frameWidth);
            expectedArray[expectedArray.length - 1] = 1;
            expect(result.hex).to.equal(expectedArray.map(numToPaddedHex).join(""))
        });
        it('should display the beginning of message when scrolled to content start', () => {
            animation.scroll(-frameWidth);
            let result = getOffsetArray(frameWidth);
            for (let i = 0; i < bitmap.length && i < frameWidth; i++) {
                expectedArray[i] = bitmap[i];
            }
            expect(result.hex).to.equal(expectedArray.map(numToPaddedHex).join(""))
        });
        it('should display the end padding when scrolled past message', () => {
            animation.scroll(-frameWidth - messageLength);
            let result = getOffsetArray(frameWidth);
            expect(result.hex).to.equal(expectedArray.map(numToPaddedHex).join(""));
        });
    };

    describe('when message is shorter than frame width', () => {

        const messageLength = 1;
        const frameWidth = 3;
        runTests(messageLength, frameWidth);
    });
    describe('when message is longer than frame width', () => {
        const messageLength = 5;
        const frameWidth = 3;
        runTests(messageLength, frameWidth);

    });

});