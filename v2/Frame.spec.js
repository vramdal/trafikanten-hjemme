const expect = require("chai").expect;
const bitmapTo8Lines = require('./BitmapUtil').bitmapTo8Lines;
const Frame = require("./Frame.js");
const printRuler = require('./BitmapUtil').printRuler;

describe('Frame', () => {

    beforeEach(() => {
        "use strict";
        printRuler();
    });

    let imageHex = "7e1010107e001c2a2a2a1800427e0200427e02001c2222221c00000000003c020c023c001c2222221c003e10202000427e02000c12127e0000007a000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000";
    let bitmap = Buffer.from(imageHex, "hex");

    it('should display a bitmap when there is enough space', () => {
        let frame = new Frame(0, 128);
        frame.setBitmap(bitmap);
        bitmapTo8Lines(frame.bitmap);
        let hex = Buffer.from(frame.bitmap).toString('hex');
        expect(hex).to.equal(imageHex);
    });

    describe('cropping', () => {
        it('should crop a bitmap to the desired length', () => {
            let frame = new Frame(0, 40);
            frame.setBitmap(bitmap);
            let expectedHex = "7e1010107e001c2a2a2a1800427e0200427e02001c2222221c00000000003c020c023c001c222222";
            bitmapTo8Lines(frame.bitmap);
            let hex = Buffer.from(frame.bitmap).toString("hex");
            expect(hex).to.equal(expectedHex);
        });
    });

    describe('scrolling', () => {
        it('should scroll 10 left', () => {
            let expected = `································································································································
··██··██·····························██·····█···█···············································································
···█···█···███······█···█··███··█·██··█·····█···█···············································································
█··█···█··█···█·····█···█·█···█·██····█···███···█···············································································
█··█···█··█···█·····█·█·█·█···█·█·····█··█··█···█···············································································
···█···█··█···█·····█·█·█·█···█·█·····█··█··█···················································································
··███·███··███·······█·█···███··█····███··███···█···············································································
································································································································`;
            let expectedHex = "1800427e0200427e02001c2222221c00000000003c020c023c001c2222221c003e10202000427e02000c12127e0000007a00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000";
            let frame = new Frame(0, 128);
            frame.setBitmap(bitmap);
            frame.scroll(-10);
            expect(bitmapTo8Lines(frame.bitmap)).to.equal(expected);
            let hex = Buffer.from(frame.bitmap).toString('hex');
            expect(hex).to.equal(expectedHex);
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
            let expectedHex = "000000000000000000007e1010107e001c2a2a2a1800427e0200427e02001c2222221c00000000003c020c023c001c2222221c003e10202000427e02000c12127e0000007a0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000";
            let frame = new Frame(0, 128);
            frame.setBitmap(bitmap);
            frame.scroll(10);
            expect(bitmapTo8Lines(frame.bitmap)).to.equal(expected);
            let hex = Buffer.from(frame.bitmap).toString('hex');
            expect(hex).to.equal(expectedHex);
        });
        it('should have a blank screen when completed scrolling left', () => {
            let frame = new Frame(0, 128);
            frame.setBitmap(bitmap);
            frame.scroll(-128);
            bitmapTo8Lines(frame.bitmap);
            let hex = Buffer.from(frame.bitmap).toString('hex');
            expect(hex).to.equal("0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000")
        });
        it('should have a blank screen when completed scrolling right', () => {
            let frame = new Frame(0, 128);
            frame.setBitmap(bitmap);
            frame.scroll(128);
            bitmapTo8Lines(frame.bitmap);
            let hex = Buffer.from(frame.bitmap).toString('hex');
            expect(hex).to.equal("0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000");
            expect(frame.bitmap.length).to.equal(128);
        });
        it('should fill with whitespace when the source is smaller than the frame', () => {
            let imageHex = "7e1010107e001c2a2a2a1800427e0200427e02001c2222221c00000000003c020c023c001c2222221c003e10202000427e02000c12127e0000007a";
            let bitmap = Buffer.from(imageHex, "hex");
            let frame = new Frame(0, 128);
            frame.setBitmap(bitmap);
            frame.scroll(+1);
            expect(frame.bitmap.length).to.equal(128);
            bitmapTo8Lines(frame.bitmap);
        });
        it('should correctly report number of scrollable pixels remaining', () => {
            let imageHex = "7e1010107e001c2a2a2a1800427e0200427e02001c2222221c00000000003c020c023c001c2222221c003e10202000427e02000c12127e0000007a";
            let bitmap = Buffer.from(imageHex, "hex");
            let frame = new Frame(0, 128);
            frame.setBitmap(bitmap);
            let startingRemainingScrollWidth = bitmap.length + 128 * 2;
            expect(frame.scrollWidth).to.equal(startingRemainingScrollWidth);
            expect(frame.remainingScrollWidth).to.equal(startingRemainingScrollWidth); // 315
            frame.scroll(-1);
            expect(frame._scrollOffset).to.equal(-1);
            expect(frame.remainingScrollWidth).to.equal(314);
            expect(frame.scrollWidth).to.equal(startingRemainingScrollWidth);
            frame.scroll(-314);
            expect(frame.remainingScrollWidth).to.equal(0);
            frame.scroll(-1);
            expect(frame.remainingScrollWidth).to.equal(0);
            expect(frame._scrollOffset).to.equal(-startingRemainingScrollWidth);

        });
    });

});