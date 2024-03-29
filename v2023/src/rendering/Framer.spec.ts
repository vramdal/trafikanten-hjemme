const Framer = require("./Framer.js");
const NoAnimation = require("../animations/NoAnimation.js");


describe('Framer', () => {

    const framer = new Framer();
    const TEXT_1 = "Hello, world!";
    const TEXT_2 = "Hello, world, again!";

    const MESSAGE_SPEC = [{
        text: TEXT_1,
        start: 0, end: 127, lines: 1,
        animation: {
            animationName: "NoAnimation",
            timeoutTicks: 10,
            alignment: "left"

        }
    }];


    describe('parseFrameSpec', () => {
        it('should set correct start, end and animation', () => {
            "use strict";
            let result = framer.parse(MESSAGE_SPEC)[0];
            expect(result.parts).toHaveLength(1);
            let part = result.parts[0];
            expect(part.text).toEqual(TEXT_1);
            expect(part.frame.x).toEqual(0);
            expect(part.frame.width).toEqual(127);
            expect(part.frame.lines).toEqual(1);
            expect(part.frame._animation).toEqual(new NoAnimation(10, "left"));


        });
    });

    describe('parse', () => {
        it('should create two frames for a message in two parts', () => {
            "use strict";
            let messageSpec = [...MESSAGE_SPEC, {
                text : TEXT_2,
                start: 128, end: 255, lines: 1,
                animation: {
                    animationName: "NoAnimation",
                    timeoutTicks: 10,
                    alignment: "left"
                }
            }];
            let result = framer.parse(messageSpec)[0];
            expect(result.parts).toHaveLength(2);
        })
    });
});
