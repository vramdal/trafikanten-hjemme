const expect = require("chai").expect;

const LinebreakAnnotation = require("../rendering/LinebreakAnnotation.js");
const VerticalScrolling = require("./VerticalScrolling.js");

describe('VerticalScrollingAnimation', () => {

    const FRAME_WIDTH = 16;


    it('should scroll in a single line', () => {
        let source = new Uint8Array(3).fill(0xFF);
        source.annotations = [];
        let animation = new VerticalScrolling(2);
        animation.setSource(source, FRAME_WIDTH);
        expect(animation._textLayout.pages).to.have.lengthOf(1);
        expect(animation.getTranslated(0)).to.equal(0);
        expect(animation.getTranslated(1)).to.equal(0);
        expect(animation.getTranslated(FRAME_WIDTH - 1)).to.equal(0);
        animation.tick();
        expect(animation.getTranslated(0)).to.equal(parseInt("00000001", 2));
        animation.tick();
        expect(animation.getTranslated(0)).to.equal(parseInt("00000011", 2));
        animation.tick();
        expect(animation.getTranslated(0)).to.equal(parseInt("00000111", 2));
        animation.tick();
        expect(animation.getTranslated(0)).to.equal(parseInt("00001111", 2));
        animation.tick();
        expect(animation.getTranslated(0)).to.equal(parseInt("00011111", 2));
        animation.tick();
        expect(animation.getTranslated(0)).to.equal(parseInt("00111111", 2));
        animation.tick();
        expect(animation.getTranslated(0)).to.equal(parseInt("01111111", 2));
        animation.tick();
        expect(animation.getTranslated(0)).to.equal(parseInt("11111111", 2));
/*
        animation.tick();
        expect(animation.getTranslated(0)).to.equal(parseInt("10101010", 2));
        animation.tick();
        expect(animation.getTranslated(0)).to.equal(parseInt("10101010", 2));
        animation.tick();
        expect(animation.getTranslated(0)).to.equal(parseInt("10101010", 2));
        animation.tick();
        expect(animation.getTranslated(0)).to.equal(parseInt("10101010", 2));
        animation.tick();
        expect(animation.getTranslated(0)).to.equal(parseInt("10101010", 2));
        animation.tick();
        expect(animation.getTranslated(0)).to.equal(parseInt("10101010", 2));
        animation.tick();
*/
    });
    it('should break a text into multiple lines and scroll them', () => {
        let source = new Uint8Array(18)
            .fill(parseInt("11111111", 2), 0, FRAME_WIDTH)
            .fill(parseInt("11111111", 2), FRAME_WIDTH);
        source.annotations = [new LinebreakAnnotation(FRAME_WIDTH + 1, FRAME_WIDTH + 1)];
        let animation = new VerticalScrolling(2);
        animation.setSource(source, FRAME_WIDTH, 2);
        expect(animation._textLayout.pages).to.have.lengthOf(2);
        expect(animation.getTranslatedOnLine(0, 0)).to.equal(0);
        expect(animation.getTranslatedOnLine(0, 1)).to.equal(0);
        animation.tick();
        expect(animation.getTranslatedOnLine(0, 0)).to.equal(0b00000000);
        expect(animation.getTranslatedOnLine(0, 1)).to.equal(0b00000001);
        animation.tick();
        expect(animation.getTranslatedOnLine(0, 0)).to.equal(0b00000000);
        expect(animation.getTranslatedOnLine(0, 1)).to.equal(0b00000011);
        animation.tick();
        expect(animation.getTranslatedOnLine(0, 0)).to.equal(0b00000000);
        expect(animation.getTranslatedOnLine(0, 1)).to.equal(0b00000111);
        animation.tick();
        animation.tick();
        animation.tick();
        animation.tick();
        animation.tick();
        expect(animation.getTranslatedOnLine(0, 0)).to.equal(0b00000000);
        expect(animation.getTranslatedOnLine(0, 1)).to.equal(0b11111111);
        animation.tick();
        expect(animation.getTranslatedOnLine(0, 0)).to.equal(0b00000000);
        expect(animation.getTranslatedOnLine(0, 1)).to.equal(0b11111110);
        animation.tick();
        expect(animation.getTranslatedOnLine(0, 0)).to.equal(0b00000000);
        expect(animation.getTranslatedOnLine(0, 1)).to.equal(0b11111100);
        animation.tick();
        expect(animation.getTranslatedOnLine(0, 0)).to.equal(0b00000001);
        expect(animation.getTranslatedOnLine(0, 1)).to.equal(0b11111001);
        animation.tick();
        expect(animation.getTranslatedOnLine(0, 0)).to.equal(0b00000011);
        expect(animation.getTranslatedOnLine(0, 1)).to.equal(0b11110011);
        animation.tick();
        expect(animation.getTranslatedOnLine(0, 0)).to.equal(0b00000111);
        expect(animation.getTranslatedOnLine(0, 1)).to.equal(0b11100111);
        animation.tick();
        expect(animation.getTranslatedOnLine(0, 0)).to.equal(0b00001111);
        expect(animation.getTranslatedOnLine(0, 1)).to.equal(0b11001111);
        animation.tick();
        expect(animation.getTranslatedOnLine(0, 0)).to.equal(0b00011111);
        expect(animation.getTranslatedOnLine(0, 1)).to.equal(0b10011111);
        animation.tick();
        expect(animation.getTranslatedOnLine(0, 0)).to.equal(0b00111111);
        expect(animation.getTranslatedOnLine(0, 1)).to.equal(0b00111111);
        animation.tick();
        expect(animation.getTranslatedOnLine(0, 0)).to.equal(0b01111111);
        expect(animation.getTranslatedOnLine(0, 1)).to.equal(0b01111111);
        animation.tick();
        expect(animation.getTranslatedOnLine(0, 0)).to.equal(0b11111111);
        expect(animation.getTranslatedOnLine(0, 1)).to.equal(0b11111111);
        animation.tick();
        expect(animation.getTranslatedOnLine(0, 0)).to.equal(0b11111111);
        expect(animation.getTranslatedOnLine(0, 1)).to.equal(0b11111111);
        animation.tick();
        expect(animation.getTranslatedOnLine(0, 0)).to.equal(0b11111111);
        expect(animation.getTranslatedOnLine(0, 1)).to.equal(0b11111111);
        animation.tick();
        expect(animation.getTranslatedOnLine(0, 0)).to.equal(0b11111110);
        expect(animation.getTranslatedOnLine(0, 1)).to.equal(0b11111110);
        animation.tick();
        expect(animation.getTranslatedOnLine(0, 0)).to.equal(0b11111100);
        expect(animation.getTranslatedOnLine(0, 1)).to.equal(0b11111100);
        animation.tick();
        expect(animation.getTranslatedOnLine(0, 0)).to.equal(0b11111001);
        expect(animation.getTranslatedOnLine(0, 1)).to.equal(0b11111000);
        animation.tick();
        expect(animation.getTranslatedOnLine(0, 0)).to.equal(0b11110011);
        expect(animation.getTranslatedOnLine(0, 1)).to.equal(0b11110000);
        animation.tick();
        expect(animation.getTranslatedOnLine(0, 0)).to.equal(0b11100111);
        expect(animation.getTranslatedOnLine(0, 1)).to.equal(0b11100000);
        animation.tick();
        expect(animation.getTranslatedOnLine(0, 0)).to.equal(0b11001111);
        expect(animation.getTranslatedOnLine(0, 1)).to.equal(0b11000000);
        animation.tick();
        expect(animation.getTranslatedOnLine(0, 0)).to.equal(0b10011111);
        expect(animation.getTranslatedOnLine(0, 1)).to.equal(0b10000000);
        animation.tick();
        expect(animation.getTranslatedOnLine(0, 0)).to.equal(0b00111111);
        expect(animation.getTranslatedOnLine(0, 1)).to.equal(0b00000000);
        animation.tick();
        expect(animation.getTranslatedOnLine(0, 0)).to.equal(0b01111111);
        expect(animation.getTranslatedOnLine(0, 1)).to.equal(0b00000000);
        animation.tick();
        expect(animation.getTranslatedOnLine(0, 0)).to.equal(0b11111111);
        expect(animation.getTranslatedOnLine(0, 1)).to.equal(0b00000000);
        animation.tick();
        animation.tick();
        animation.tick();
        animation.tick();
        animation.tick();
        animation.tick();
        animation.tick();
        animation.tick();
        animation.tick();
        animation.tick();
        expect(animation.getTranslatedOnLine(0, 0)).to.equal(0b00000000);
        expect(animation.getTranslatedOnLine(0, 1)).to.equal(0b00000000);
    });
});