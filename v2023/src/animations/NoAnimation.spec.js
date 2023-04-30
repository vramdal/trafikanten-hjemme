const NoAnimation = require("./NoAnimation");

const FRAME_WIDTH = 5;
const BITMAP_FIRST_BYTE = 254;
const BITMAP_LAST_BYTE = 255;
const TIMEOUT_TICKS = 3;

describe('NoAnimation', () => {

    let animation;

    function createBitmap(width, ...markedIdxs) {
        let bitmap = new Uint8Array(width).fill(2);
        for (let idx in markedIdxs) {
            bitmap[idx] = idx + 1;
        }
        bitmap[0] = BITMAP_FIRST_BYTE;
        bitmap[width - 1] = BITMAP_LAST_BYTE;
        return bitmap;
    }

    function getResultBitmap() {
        return new Array(FRAME_WIDTH).fill(undefined).map((_, idx) => animation.getTranslated(idx));
    }

    function createAndSetBitmap(width, ...markedIdxs) {
        const bitmap = createBitmap(width, markedIdxs);
        animation.setSource(bitmap, FRAME_WIDTH);
        return getResultBitmap();
    }

    describe('alignment', () => {

        describe('leftAlign', () => {

            beforeEach(() => {
                animation = new NoAnimation(TIMEOUT_TICKS, "left");
            });

            it('should align a short message to the left of the frame', () => {
                expect(createAndSetBitmap(FRAME_WIDTH - 2)).toEqual(
                    [BITMAP_FIRST_BYTE, 2, BITMAP_LAST_BYTE, 0, 0]
                );
            });
            it('should crop a long message while still align to the left of the frame', () => {
                expect(createAndSetBitmap(FRAME_WIDTH + 2)).toEqual(
                    [BITMAP_FIRST_BYTE, 2, 2, 2, 2]
                );
            });
        });

        describe('centerAlign', () => {

            beforeEach(() => {
                animation = new NoAnimation(TIMEOUT_TICKS, "center");
            });

            it('should center a short message', () => {
                expect(createAndSetBitmap(FRAME_WIDTH - 2)).toEqual(
                    [0, BITMAP_FIRST_BYTE, 2, BITMAP_LAST_BYTE, 0]
                );
            });
            it('should center a long message, and let it overflow on both sides', () => {
                expect(createAndSetBitmap(FRAME_WIDTH + 2, 0, 1, 2, 3, 4)).toEqual(
                    [2, 2, 2, 2, 2]
                );
            });


        });

        describe('rightAlign', () => {

            beforeEach(() => {
                animation = new NoAnimation(TIMEOUT_TICKS, "right");
            });

            it('should align a short message to the right of the frame', () => {
                expect(createAndSetBitmap(FRAME_WIDTH - 2)).toEqual(
                    [0, 0, BITMAP_FIRST_BYTE, 2, BITMAP_LAST_BYTE]
                );
            });
            it('should crop a long message while still align to the right of the frame', () => {
                expect(createAndSetBitmap(FRAME_WIDTH + 2)).toEqual(
                    [2, 2, 2, 2, BITMAP_LAST_BYTE]
                );
            });
        });
    });

});
