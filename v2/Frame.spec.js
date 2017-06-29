const expect = require("chai").expect;
const bitmapTo8Lines = require('./BitmapUtil').bitmapTo8Lines;
const Frame = require("./Frame.js");
const printRuler = require('./BitmapUtil').printRuler;

describe('Frame', () => { // TODO: Write tests for non-scrolling frame also

    beforeEach(() => {
        "use strict";
        printRuler();
    });

    let imageHex = "7e1010107e001c2a2a2a1800427e0200427e02001c2222221c00000000003c020c023c001c2222221c003e10202000427e02000c12127e0000007a000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000";
    let bitmap = Buffer.from(imageHex, "hex");

    it('should display a bitmap when there is enough space', () => {
        let frame = new Frame(0, 128);
        frame.setBitmap(bitmap);
        frame.scroll(-128);
        bitmapTo8Lines(frame.bitmap);
        let hex = Buffer.from(frame.bitmap).toString('hex');
        expect(hex).to.equal(imageHex);
    });

    describe('cropping', () => {
        it('should crop a bitmap to the desired length', () => {
            let frame = new Frame(0, 40);
            frame.setBitmap(bitmap);
            frame.scroll(-40);
            let expectedHex = "7e1010107e001c2a2a2a1800427e0200427e02001c2222221c00000000003c020c023c001c222222";
            bitmapTo8Lines(frame.bitmap);
            let hex = Buffer.from(frame.bitmap).toString("hex");
            expect(hex).to.equal(expectedHex);
        });
    });

    describe('scrolling', () => {
        it('should scroll 10 + width left', () => {
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
            frame.scroll(-10 - 128);
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
            frame.scroll(10 - 128);
            expect(bitmapTo8Lines(frame.bitmap)).to.equal(expected);
            let hex = Buffer.from(frame.bitmap).toString('hex');
            expect(hex).to.equal(expectedHex);
        });
        it('should have a blank screen when completed scrolling left', () => {
            let frame = new Frame(0, 128);
            frame.setBitmap(bitmap);
            frame.scroll(-128 - bitmap.length);
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

    describe('getAdjustedByScrollOffset', () => {
        function getOffsetArray(frame) {
            let array = new Array(frame.width);
            for (let i = 0; i < array.length; i++) {
                array[i] = frame._getAdjustedByScrollOffset(i);
            }
            return {array, hex: array.map(byte => numToPaddedHex(byte)).join("")};
        }

        function numToPaddedHex(num) {
            "use strict";
            let h = (num).toString(16);
            return h.length % 2 ? '0' + h : h;
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
            let frame;
            beforeEach(() => {
                "use strict";
                frame = new Frame(0, frameWidth);
                frame.setBitmap(bitmap);
                expectedArray = new Array(frameWidth).fill(0);
            });

            it('should display only padding when not scrolled', () => {
                "use strict";
                let result = getOffsetArray(frame);
                expect(result.hex).to.equal(expectedArray.map(numToPaddedHex).join(""));
            });
            it('should start displaying content from the right when scrolling', () => {
                frame.scroll(-1);
                let result = getOffsetArray(frame);
                expectedArray[expectedArray.length - 1] = 1;
                expect(result.hex).to.equal(expectedArray.map(numToPaddedHex).join(""))
            });
            it('should display the beginning of message when scrolled to content start', () => {
                frame.scroll(-frameWidth);
                let result = getOffsetArray(frame);
                for (let i = 0; i < bitmap.length && i < frame.width; i++) {
                    expectedArray[i] = bitmap[i];
                }
                expect(result.hex).to.equal(expectedArray.map(numToPaddedHex).join(""))
            });
            it('should display the end padding when scrolled past message', () => {
                frame.scroll(-frameWidth - messageLength);
                let result = getOffsetArray(frame);
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

});