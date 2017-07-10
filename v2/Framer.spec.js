const expect = require("chai").expect;

const Framer = require("./Framer.js");
const NoAnimation = require("./animations/NoAnimation.js");


describe('Framer', () => {

    const framer = new Framer();
    const TEXT_1 = "Hello, world!";
    const TEXT_2 = "Hello, world, again!";

    const MESSAGE_SPEC = [{
        text: TEXT_1,
        start: 0, end: 127, lines: 1,
        animationName: "NoAnimation",
        timeoutTicks: 10,
        alignment: "left"
    }];


    describe('parseFrameSpec', () => {
        it('should set correct start, end and animation', () => {
            "use strict";
            let result = framer.parse(MESSAGE_SPEC);
            expect(result.parts).to.have.lengthOf(1);
            let part = result.parts[0];
            expect(part.text).to.equal(TEXT_1);
            expect(part.frame.x).to.equal(0);
            expect(part.frame.width).to.equal(127);
            expect(part.frame.lines).to.equal(1);
            expect(part.frame._animation).to.eql(new NoAnimation(10, "left"));


        });
    });
    
    describe('parse', () => {
        it('should create two frames for a message in two parts', () => {
            "use strict";
            let messageSpec = [...MESSAGE_SPEC, {
                text : TEXT_2,
                start: 128, end: 255, lines: 1,
                animationName: "NoAnimation",
                timeoutTicks: 10,
                alignment: "left"
            }];
            let result = framer.parse(messageSpec);
            expect(result.parts).to.have.lengthOf(2);
        })
    });
});