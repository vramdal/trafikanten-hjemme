// @flow
const expect = require("chai").expect;
const HardLinebreakingCharacterProcessor = require("./HardLinebreakingCharacterProcessor.js");

describe('HardLinebreakingCharacterProcessor', () => {

    let processor;

    beforeEach(() => {
        processor = new HardLinebreakingCharacterProcessor();
    });

    describe('processCharacter', () => {
        it('should recognize a single linebreak', () => {
            const text = "Hello,\nworld!";
            for (let i = 0; i < text.length; i++) {
                const charactersConsumed = processor.processCharacter(text, i);
                expect(charactersConsumed).to.equal(1);
            }
            expect(processor.characterMap).to.have.lengthOf(1);
            const characterAtPosition = processor.characterMap[0];
            expect(characterAtPosition).to.eql({chIdx: 6, str: '\n'});
        });
        it('should recognize multiple linebreaks', () => {
            const text = "Hello,\nworld,\nand you!";
            for (let i = 0; i < text.length; i++) {
                const charactersConsumed = processor.processCharacter(text, i);
                expect(charactersConsumed).to.equal(1);
            }
            expect(processor.characterMap).to.have.lengthOf(2);
            expect(processor.characterMap[0]).to.eql({chIdx:  6, str: '\n'});
            expect(processor.characterMap[1]).to.eql({chIdx: 13, str: '\n'});
        });

    });

    describe('mapCharacterToPosition', () => {

        const strLength = 10;
        const glyphWidth = 10;

        it('should map a single linebreak', () => {
            processor.characterMap.push({chIdx: 6, str: '\n'});
            for (let i = 0; i < strLength; i++) {
                processor.mapCharacterToPosition(i, i * glyphWidth);
            }
            expect(processor.linebreaks).to.have.lengthOf(1);
            expect(processor.linebreaks[0]).to.eql(
                {chStart: 6, chEnd: 7, xStart: 60, xEnd: 60}
            );
        });
    });
});