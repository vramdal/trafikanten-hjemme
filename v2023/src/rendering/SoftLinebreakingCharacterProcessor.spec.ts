import LinebreakingCharacterProcessor from "./SoftLinebreakingCharacterProcessor";

describe('SoftLinebreakingCharacterProcessor', () => {

    let processor;

    beforeEach(() => {
        processor = new LinebreakingCharacterProcessor();
    });

    describe('processCharacter', () => {
        it('should recognize a single space', () => {
            const text = "Hello, world!";
            for (let i = 0; i < text.length; i++) {
                const charactersConsumed = processor.processCharacter(text, i);
                expect(charactersConsumed).toEqual([]);
            }
            expect(processor.characterMap).toHaveLength(1);
            const characterAtPosition = processor.characterMap[0];
            expect(characterAtPosition).toEqual({chIdx: 6, str: ' '});
        });
        it('should recognize two linebreaking opportunities', () => {
            const text = "Hello, world, again!";
            for (let i = 0; i < text.length; i++) {
                const charactersConsumed = processor.processCharacter(text, i);
                expect(charactersConsumed).toEqual([]);
            }
            expect(processor.characterMap).toHaveLength(2);
            expect(processor.characterMap[0]).toEqual({chIdx: 6, str: ' '});
            expect(processor.characterMap[1]).toEqual({chIdx: 13, str: ' '});
        });
        it('should normalize consecutive linebreaking characters', () => {
            const text = "Hello,   world!";
            for (let i = 0; i < text.length; i++) {
                const charactersConsumed = processor.processCharacter(text, i);
                expect(charactersConsumed).toEqual([]);
            }
            expect(processor.characterMap).toHaveLength(1);
            expect(processor.characterMap[0]).toEqual({chIdx: 6, str: '   '});
        });
        it('should normalize consecutive linebreaking characters multiple places', () => {
            const text = "Hello,   world,  again!";
            for (let i = 0; i < text.length; i++) {
                const charactersConsumed = processor.processCharacter(text, i);
                expect(charactersConsumed).toEqual([]);
            }
            expect(processor.characterMap).toHaveLength(2);
            expect(processor.characterMap[0]).toEqual({chIdx: 6, str: '   '});
            expect(processor.characterMap[1]).toEqual({chIdx: 15, str: '  '});
        });
        it('should disregard linebreak opportunities at end of string', () => {
           const text = "Hello, world! ";
            for (let i = 0; i < text.length; i++) {
                const charactersConsumed = processor.processCharacter(text, i);
                expect(charactersConsumed).toEqual([]);
            }
            expect(processor.characterMap).toHaveLength(1);
            expect(processor.characterMap[0]).toEqual({chIdx: 6, str: ' '});
        });
    });

    describe('mapCharacterToPosition', () => {

        const strLength = 10;
        const glyphWidth = 10;

        it('should map a single linebreak', () => {
            processor.characterMap.push({chIdx: 6, str: ' '});
            for (let i = 0; i < strLength; i++) {
                processor.mapCharacterToPosition(i, i * glyphWidth);
            }
            expect(processor.softLinebreaksAtPositions).toHaveLength(1);
            expect(processor.softLinebreaksAtPositions[0]).toEqual(
                {chStart: 6, chEnd: 7, xStart: 60, xEnd: 70}
            );
        });

        it('should map a linebreak over multiple characters', () => {
            processor.characterMap.push({chIdx: 6, str: '  '});
            for (let i = 0; i < strLength; i++) {
                processor.mapCharacterToPosition(i, i * glyphWidth);
            }
            expect(processor.softLinebreaksAtPositions).toHaveLength(1);
            expect(processor.softLinebreaksAtPositions[0]).toEqual(
                {chStart: 6, chEnd: 8, xStart: 60, xEnd: 80}
            );
        });
    });
});
