const expect = require("chai").expect;

const LinebreakAnnotation = require("../rendering/LinebreakAnnotation.js");
const VerticalScrolling = require("./VerticalScrolling.js");

describe('VerticalScrollingAnimation', () => {

    const FRAME_WIDTH = 16;


    it('should scroll in a single line', () => {
        let source = new Uint8Array(3).fill(parseInt("10101010", 2));
        source.annotations = [];
        let animation = new VerticalScrolling(2);
        animation.setSource(source, FRAME_WIDTH);
        expect(animation._pages).to.have.lengthOf(1);
        expect(animation.getTranslated(0)).to.equal(0);
        expect(animation.getTranslated(1)).to.equal(0);
        expect(animation.getTranslated(FRAME_WIDTH - 1)).to.equal(0);
        animation.tick();
        expect(animation.getTranslated(0)).to.equal(parseInt("00000001", 2));
        animation.tick();
        expect(animation.getTranslated(0)).to.equal(parseInt("00000010", 2));
        animation.tick();
        expect(animation.getTranslated(0)).to.equal(parseInt("00000101", 2));
        animation.tick();
        expect(animation.getTranslated(0)).to.equal(parseInt("00001010", 2));
        animation.tick();
        expect(animation.getTranslated(0)).to.equal(parseInt("00010101", 2));
        animation.tick();
        expect(animation.getTranslated(0)).to.equal(parseInt("00101010", 2));
        animation.tick();
        expect(animation.getTranslated(0)).to.equal(parseInt("01010101", 2));
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
        expect(animation.getTranslated(0)).to.equal(parseInt("10101010", 2));
        animation.tick();
    });
    it('should break a text into multiple lines and scroll them', () => {
        let source = new Uint8Array(18)
            .fill(parseInt("11101100", 2), 0, FRAME_WIDTH)
            .fill(parseInt("10011101", 2), FRAME_WIDTH);
        source.annotations = [new LinebreakAnnotation(FRAME_WIDTH + 1, FRAME_WIDTH + 1)];
        let animation = new VerticalScrolling();
        animation.setSource(source, FRAME_WIDTH);
        expect(animation._pages).to.have.lengthOf(2);
        expect(animation.getTranslated(0)).to.equal(0);
        expect(animation.getTranslated(FRAME_WIDTH)).to.equal(0);
        animation.tick();
        expect(animation.getTranslated(0)).to.equal(0b00000001);
        expect(animation.getTranslated(FRAME_WIDTH)).to.equal(0b11011001);
        animation.tick();
        expect(animation.getTranslated(0)).to.equal(0b00000011);
        expect(animation.getTranslated(FRAME_WIDTH)).to.equal(0b10110010);
        animation.tick();
        expect(animation.getTranslated(0)).to.equal(0b00000111);
        expect(animation.getTranslated(FRAME_WIDTH)).to.equal(0b01100100);
        animation.tick();
        expect(animation.getTranslated(0)).to.equal(0b00001110);
        expect(animation.getTranslated(FRAME_WIDTH)).to.equal(0b11001001);
        animation.tick();
        expect(animation.getTranslated(0)).to.equal(0b00011101);
        expect(animation.getTranslated(FRAME_WIDTH)).to.equal(0b10010011);
        animation.tick();
        expect(animation.getTranslated(0)).to.equal(0b00111011);
        expect(animation.getTranslated(FRAME_WIDTH)).to.equal(0b00100111);
        animation.tick();
        expect(animation.getTranslated(0)).to.equal(0b01110110);
        expect(animation.getTranslated(FRAME_WIDTH)).to.equal(0b01001110);
        animation.tick();
        expect(animation.getTranslated(0)).to.equal(0b11101100);
        expect(animation.getTranslated(FRAME_WIDTH)).to.equal(0b10011101);



    });
});