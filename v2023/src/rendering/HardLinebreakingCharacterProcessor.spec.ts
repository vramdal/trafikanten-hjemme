const HardLinebreakingCharacterProcessor = require("./HardLinebreakingCharacterProcessor");
import type {AnnotatedBitmap} from "../bitmap/Bitmap";

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
                expect(charactersConsumed).toEqual(i === 6 ? [null] : []);
            }
            expect(processor.characterMap).toHaveLength(1);
            const characterAtPosition = processor.characterMap[0];
            expect(characterAtPosition).toEqual({chIdx: 6, str: '\n'});
        });
        it('should recognize multiple linebreaks', () => {
            const text = "Hello,\nworld,\nand you!";
            for (let i = 0; i < text.length; i++) {
                const charactersConsumed = processor.processCharacter(text, i);
                expect(charactersConsumed).toEqual(i === 6 || i === 13 ? [null] : []);
            }
            expect(processor.characterMap).toHaveLength(2);
            expect(processor.characterMap[0]).toEqual({chIdx:  6, str: '\n'});
            expect(processor.characterMap[1]).toEqual({chIdx: 13, str: '\n'});
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
            expect(processor.linebreaks).toHaveLength(1);
            expect(processor.linebreaks[0]).toEqual(
                {chStart: 6, chEnd: 7, xStart: 60, xEnd: 60}
            );
        });
    });

    describe('place', () => {

        let bitmap : AnnotatedBitmap;

        beforeEach(() => {
            let aBitmap : any = new Uint8Array(new ArrayBuffer(20));
            aBitmap.annotations = [];
            aBitmap.sourceString = "a\nb";
            bitmap = aBitmap;

        });

        it('should place linebreak annotations', () => {
            processor.linebreaks = [{chStart: 6, chEnd: 7, xStart: 60, xEnd: 60}, {chStart: 10, chEnd: 11, xStart: 80, xEnd: 90}];
            processor.place(bitmap);
            expect(bitmap.annotations).toHaveLength(2);
            expect(bitmap.annotations[0]).toEqual({start: 60, end: 60, type : "Hard"});
            expect(bitmap.annotations[1]).toEqual({start: 80, end: 90, type : "Hard"});
        });
    });
});
