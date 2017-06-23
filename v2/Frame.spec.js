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
        let frame = new Frame(128, bitmap);
        bitmapTo8Lines(frame.bitmap);
        let hex = Buffer.from(frame.bitmap).toString('hex');
        expect(hex).to.equal(imageHex);
    });

    describe('cropping', () => {
        it('should crop a bitmap to the desired length', () => {
            let frame = new Frame(40, bitmap);
            let expectedHex = "7e1010107e001c2a2a2a1800427e0200427e02001c2222221c00000000003c020c023c001c222222";
            bitmapTo8Lines(frame.bitmap);
            let hex = Buffer.from(frame.bitmap).toString("hex");
            expect(hex).to.equal(expectedHex);
        });
    });

    describe('scrolling', () => {
        it('should scroll left', () => {
            let frame = new Frame(128, bitmap);
            frame.scroll(-10);
            bitmapTo8Lines(frame.bitmap);
            let hex = Buffer.from(frame.bitmap).toString('hex');
            console.log("hex = ", hex);
        });
    });

});