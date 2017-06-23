const expect = require("chai").expect;
const bitmapTo8Lines = require('./BitmapUtil').bitmapTo8Lines;
const Frame = require("./Frame.js");
const printRuler = require('./BitmapUtil').printRuler;

describe('Frame', () => {

    beforeEach(() => {
        "use strict";
        printRuler();
    });

    let bitmapHex = "7e1010107e001c2a2a2a1800427e0200427e02001c2222221c00000000003c020c023c001c2222221c003e10202000427e02000c12127e0000007a000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000";
    let bitmap = Buffer.from(bitmapHex, "hex");

    it('should display a bitmap when there is enough space', () => {
        let frame = new Frame(35, bitmap);
        bitmapTo8Lines(frame.bitmap);
    });
});