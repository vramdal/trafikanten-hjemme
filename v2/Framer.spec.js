const expect = require("chai").expect;

const SimpleTypes = require("./SimpleTypes.js");
const Framer = require("./Framer.js");
const NoAnimation = require("./animations/NoAnimation.js");

describe('Framer', () => {

    const framer = new Framer();

    describe('parseFrameSpec', () => {
        it('should set correct start, end and animation', () => {
            let text = SimpleTypes.FORMAT_SPECIFIER_START + "\x01\x0A\x01\x05" + SimpleTypes.FORMAT_SPECIFIER_END + "Laks!";
            let parsed = framer.parseFrameSpec(text);
            expect(parsed.specLength).to.equal(6);
            expect(JSON.stringify(parsed.frameSpec)).to.equal(JSON.stringify({x: 1, end: 10, animationClass: NoAnimation, animationParameters: [5]}));
        });
    });
    
    describe('parse', () => {
        it('should create two frames for a message in two parts', () => {
            let text = SimpleTypes.FORMAT_SPECIFIER_START + "\x00\x0A\x02\x05" + SimpleTypes.FORMAT_SPECIFIER_END + "Laks!" + SimpleTypes.MESSAGE_PART_SEPARATOR + SimpleTypes.FORMAT_SPECIFIER_START + "\x10\x7F\x02\x05" + SimpleTypes.FORMAT_SPECIFIER_END + "Hei på deg!";
            let message = framer.parse(text);
            expect(message.layout.length).to.equal(2);
        })
    });
});