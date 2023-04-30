import {LinebreakAnnotation} from "../rendering/LinebreakAnnotation";

const PagingAnimation = require("./Paging");
const FRAME_WIDTH = 16;

describe('Paging', () => {
    it('should display a short message as a single page', () => {
        let source : any = new Uint8Array(3).fill(2);
        source.annotations = [new LinebreakAnnotation(2, 3)];
        source[0] = 1;
        source[2] = 255;
        let animation = new PagingAnimation(2);
        animation.setSource(source, FRAME_WIDTH);
        expect(animation._textLayout.pages).toHaveLength(1);
        animation.tick();
        expect(animation.isAnimationComplete()).toEqual(false);
        expect(animation.getAnimationRemaining()).toEqual(1);
        animation.tick();
        expect(animation.isAnimationComplete()).toEqual(true);
        expect(animation.getAnimationRemaining()).toEqual(0);
        expect(animation.getTranslated(0)).toEqual(0);
        expect(animation.getTranslated(2)).toEqual(0);
    });
    it('should break a long message in two pages per annotations', () => {
        let source : any = new Uint8Array(18).fill(2);
        source[0] = 1;
        source[6] = 255;
        source.annotations = [new LinebreakAnnotation(3, 5)];
        let animation = new PagingAnimation(2);
        animation.setSource(source, FRAME_WIDTH);
        expect(animation._textLayout.pages).toHaveLength(2);
    });
    it('should cut off the end of a word that is longer than a frame', () => {
        let source  : any = new Uint8Array(FRAME_WIDTH + 2).fill(2);
        source[0] = 1;
        source[FRAME_WIDTH - 1] = 255;
        source[source.length - 1] = 128;
        source.annotations = [];
        let animation = new PagingAnimation(2);
        animation.setSource(source, FRAME_WIDTH);
        expect(animation._textLayout.pages).toHaveLength(1);
        expect(animation.getTranslated(0)).toEqual(source[0]);
        expect(animation.getTranslated(FRAME_WIDTH - 1)).toEqual(source[FRAME_WIDTH - 1]);
        expect(animation.getTranslated(FRAME_WIDTH)).toEqual(0);
    });
    it('should break a message into multiple pages as necessary', () => {
        let source : any = new Uint8Array(FRAME_WIDTH * 3 + 2).fill(2);
        source[0] = 1;
        source[12] = 12;
        source[22] = 22;
        source[29] = 29;
        source[FRAME_WIDTH - 1] = 255;
        source[source.length - 1] = 128;
        const shouldBeIgnored = new LinebreakAnnotation(FRAME_WIDTH + 1, FRAME_WIDTH + 2);
        source.annotations = [new LinebreakAnnotation(10, 12), shouldBeIgnored, new LinebreakAnnotation(20, 22), new LinebreakAnnotation(28, 29)];
        let animation = new PagingAnimation(2);
        animation.setSource(source, FRAME_WIDTH);
        expect(animation._textLayout.pages).toHaveLength(4);
        expect(animation.getTranslated(0)).toEqual(source[0]);
        expect(animation.getTranslated(FRAME_WIDTH - 1)).toEqual(0);
        expect(animation.getTranslated(10)).toEqual(0);
        expect(animation.getTranslated(FRAME_WIDTH)).toEqual(source[12]);
        animation.tick();
        animation.tick();
        expect(animation.getTranslated(0)).toEqual(source[12]);
        animation.tick();
        animation.tick();
        expect(animation.getTranslated(0)).toEqual(0);
        animation.tick();
        animation.tick();
        expect(animation.getTranslated(0)).toEqual(0);
    });
    it('should use two lines when available', () => {
        let source : any = new Uint8Array(FRAME_WIDTH * 3 + 2).fill(2);
        source[0] = 1;
        source[12] = 12;
        source[FRAME_WIDTH] = FRAME_WIDTH;
        source[FRAME_WIDTH + 1] = FRAME_WIDTH + 1;
        source[22] = 22;
        source[29] = 29;
        source[FRAME_WIDTH - 1] = 255;
        source[source.length - 1] = 128;
        source.annotations = [
            new LinebreakAnnotation(10, 12),
            new LinebreakAnnotation(FRAME_WIDTH + 1, FRAME_WIDTH + 2),
            new LinebreakAnnotation(20, 22),
            new LinebreakAnnotation(28, 29)
        ];
        let animation = new PagingAnimation(2);
        animation.setSource(source, FRAME_WIDTH, 2);
        expect(animation.getTranslated(0)).toEqual(1);
        expect(animation.getTranslated(FRAME_WIDTH)).toEqual(12);
        animation.tick();
        animation.tick();
        expect(animation._textLayout.pages).toHaveLength(4);
        expect(animation.getTranslated(0)).toEqual(22);
        expect(animation.getTranslated(29 + FRAME_WIDTH)).toEqual(0);
    });
});
