const bitmapTo8Lines = require('./BitmapUtil').bitmapTo8Lines;
const getHexFingerprint = require('./BitmapUtil').getHexFingerprint;
const Frame = require("./Frame");
const printRuler = require('./BitmapUtil').printRuler;
const NoAnimation = require("../animations/NoAnimation.js");

describe('Frame', () => { // TODO: Write tests for non-scrolling frame also

    beforeEach(() => {
        "use strict";
        printRuler();
    });

    let imageHex = "7e1010107e001c2a2a2a1800427e0200427e02001c2222221c00000000003c020c023c001c2222221c003e10202000427e02000c12127e0000007a000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000";
    let bitmap = Buffer.from(imageHex, "hex");
    const animation = new NoAnimation(10, "left");

    it('should display a bitmap when there is enough space', () => {
        let frame = new Frame(0, 128, animation);
        frame.setBitmap(bitmap);
        expect(getHexFingerprint(bitmapTo8Lines(frame.bitmap))).toEqual(getHexFingerprint(bitmapTo8Lines(bitmap)));
    });

    describe('cropping', () => {
        it('should crop a bitmap to the desired length', () => {
            let frame = new Frame(0, 40, animation);
            frame.setBitmap(bitmap);
            let expectedHex = "7e0808087e00385454541800427e4000427e4000384444443800000000003c4030403c0038444444";
            expect(getHexFingerprint(bitmapTo8Lines(frame.bitmap))).toEqual(expectedHex);
        });
    });

    describe('multi-line', () => {
        it('should translate a linenumber and x-position to another x-position', () => {
            let bitmap = [10, 20, 30, 40, 50, 60];
            let frame = new Frame(0, 3, animation);
            frame.setBitmap(bitmap);
            expect(frame.translateCoordinates(0, 0)).toEqual(10);
            expect(frame.translateCoordinates(0, 1)).toEqual(20);
            expect(frame.translateCoordinates(0, 2)).toEqual(30);
            expect(frame.translateCoordinates(1, 0)).toEqual(40);
            expect(frame.translateCoordinates(1, 1)).toEqual(50);
            expect(frame.translateCoordinates(1, 2)).toEqual(60);
            expect(frame.translateCoordinates(2, 0)).toEqual(0);
            expect(frame.translateCoordinates(2, 1)).toEqual(0);
            expect(frame.translateCoordinates(2, 2)).toEqual(0);
        });
    });

});
