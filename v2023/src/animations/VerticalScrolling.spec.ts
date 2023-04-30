import { LinebreakAnnotation } from "../rendering/LinebreakAnnotation";

import { VerticalScrollingAnimation } from "./VerticalScrolling";

describe('VerticalScrollingAnimation', () => {

  let tick = function (scrollPixels, animation) {
    for (let i = 0; i < scrollPixels; i++) {
      animation.tick();
    }
  };

  const FRAME_WIDTH = 16;

  it('should scroll in a single line', () => {
    let source : any = new Uint8Array(3).fill(0xFF);
    source.annotations = [];
    let animation = new VerticalScrollingAnimation(2);
    animation.setSource(source, FRAME_WIDTH);
    expect(animation._textLayout.pages).toHaveLength(1);
    expect(animation.getTranslated(0)).toEqual(0);
    expect(animation.getTranslated(1)).toEqual(0);
    expect(animation.getTranslated(FRAME_WIDTH - 1)).toEqual(0);
    animation.tick();
    expect(animation.getTranslated(0)).toEqual(parseInt("00000001", 2));
    animation.tick();
    expect(animation.getTranslated(0)).toEqual(parseInt("00000011", 2));
    animation.tick();
    expect(animation.getTranslated(0)).toEqual(parseInt("00000111", 2));
    animation.tick();
    expect(animation.getTranslated(0)).toEqual(parseInt("00001111", 2));
    animation.tick();
    expect(animation.getTranslated(0)).toEqual(parseInt("00011111", 2));
    animation.tick();
    expect(animation.getTranslated(0)).toEqual(parseInt("00111111", 2));
    animation.tick();
    expect(animation.getTranslated(0)).toEqual(parseInt("01111111", 2));
    animation.tick();
    expect(animation.getTranslated(0)).toEqual(parseInt("11111111", 2));
    tick(10, animation);
    expect(animation.getAnimationRemaining()).toEqual(0);
  });
  it('should break a text into multiple lines and scroll them', () => {
    let source : any = new Uint8Array(18)
      .fill(parseInt("11111111", 2), 0, FRAME_WIDTH)
      .fill(parseInt("11111111", 2), FRAME_WIDTH);
    source.annotations = [new LinebreakAnnotation(FRAME_WIDTH + 1, FRAME_WIDTH + 1, 'Soft')];
    let animation = new VerticalScrollingAnimation(2);
    animation.setSource(source, FRAME_WIDTH, 2);
    expect(animation._textLayout.pages).toHaveLength(2);
    expect(animation.getTranslatedOnLine(0, 0)).toEqual(0);
    expect(animation.getTranslatedOnLine(0, 1)).toEqual(0);
    animation.tick();
    expect(animation.getTranslatedOnLine(0, 0)).toEqual(0b00000000);
    expect(animation.getTranslatedOnLine(0, 1)).toEqual(0b00000001);
    animation.tick();
    expect(animation.getTranslatedOnLine(0, 0)).toEqual(0b00000000);
    expect(animation.getTranslatedOnLine(0, 1)).toEqual(0b00000011);
    animation.tick();
    expect(animation.getTranslatedOnLine(0, 0)).toEqual(0b00000000);
    expect(animation.getTranslatedOnLine(0, 1)).toEqual(0b00000111);
    tick(5, animation);
    expect(animation.getTranslatedOnLine(0, 0)).toEqual(0b00000000);
    expect(animation.getTranslatedOnLine(0, 1)).toEqual(0b11111111);
    animation.tick();
    expect(animation.getTranslatedOnLine(0, 0)).toEqual(0b00000000);
    expect(animation.getTranslatedOnLine(0, 1)).toEqual(0b11111110);
    animation.tick();
    expect(animation.getTranslatedOnLine(0, 0)).toEqual(0b00000000);
    expect(animation.getTranslatedOnLine(0, 1)).toEqual(0b11111100);
    animation.tick();
    expect(animation.getTranslatedOnLine(0, 0)).toEqual(0b00000001);
    expect(animation.getTranslatedOnLine(0, 1)).toEqual(0b11111001);
    animation.tick();
    expect(animation.getTranslatedOnLine(0, 0)).toEqual(0b00000011);
    expect(animation.getTranslatedOnLine(0, 1)).toEqual(0b11110011);
    animation.tick();
    expect(animation.getTranslatedOnLine(0, 0)).toEqual(0b00000111);
    expect(animation.getTranslatedOnLine(0, 1)).toEqual(0b11100111);
    animation.tick();
    expect(animation.getTranslatedOnLine(0, 0)).toEqual(0b00001111);
    expect(animation.getTranslatedOnLine(0, 1)).toEqual(0b11001111);
    animation.tick();
    expect(animation.getTranslatedOnLine(0, 0)).toEqual(0b00011111);
    expect(animation.getTranslatedOnLine(0, 1)).toEqual(0b10011111);
    animation.tick();
    expect(animation.getTranslatedOnLine(0, 0)).toEqual(0b00111111);
    expect(animation.getTranslatedOnLine(0, 1)).toEqual(0b00111111);
    animation.tick();
    expect(animation.getTranslatedOnLine(0, 0)).toEqual(0b01111111);
    expect(animation.getTranslatedOnLine(0, 1)).toEqual(0b01111111);
    animation.tick();
    expect(animation.getTranslatedOnLine(0, 0)).toEqual(0b11111111);
    expect(animation.getTranslatedOnLine(0, 1)).toEqual(0b11111111);
    animation.tick();
    expect(animation.getTranslatedOnLine(0, 0)).toEqual(0b11111111);
    expect(animation.getTranslatedOnLine(0, 1)).toEqual(0b11111111);
    animation.tick();
    expect(animation.getTranslatedOnLine(0, 0)).toEqual(0b11111111);
    expect(animation.getTranslatedOnLine(0, 1)).toEqual(0b11111111);
    animation.tick();
    expect(animation.getTranslatedOnLine(0, 0)).toEqual(0b11111110);
    expect(animation.getTranslatedOnLine(0, 1)).toEqual(0b11111110);
    animation.tick();
    expect(animation.getTranslatedOnLine(0, 0)).toEqual(0b11111100);
    expect(animation.getTranslatedOnLine(0, 1)).toEqual(0b11111100);
    animation.tick();
    expect(animation.getTranslatedOnLine(0, 0)).toEqual(0b11111001);
    expect(animation.getTranslatedOnLine(0, 1)).toEqual(0b11111000);
    animation.tick();
    expect(animation.getTranslatedOnLine(0, 0)).toEqual(0b11110011);
    expect(animation.getTranslatedOnLine(0, 1)).toEqual(0b11110000);
    animation.tick();
    expect(animation.getTranslatedOnLine(0, 0)).toEqual(0b11100111);
    expect(animation.getTranslatedOnLine(0, 1)).toEqual(0b11100000);
    animation.tick();
    expect(animation.getTranslatedOnLine(0, 0)).toEqual(0b11001111);
    expect(animation.getTranslatedOnLine(0, 1)).toEqual(0b11000000);
    animation.tick();
    expect(animation.getTranslatedOnLine(0, 0)).toEqual(0b10011111);
    expect(animation.getTranslatedOnLine(0, 1)).toEqual(0b10000000);
    animation.tick();
    expect(animation.getTranslatedOnLine(0, 0)).toEqual(0b00111111);
    expect(animation.getTranslatedOnLine(0, 1)).toEqual(0b00000000);
    animation.tick();
    expect(animation.getTranslatedOnLine(0, 0)).toEqual(0b01111111);
    expect(animation.getTranslatedOnLine(0, 1)).toEqual(0b00000000);
    animation.tick();
    expect(animation.getTranslatedOnLine(0, 0)).toEqual(0b11111111);
    expect(animation.getTranslatedOnLine(0, 1)).toEqual(0b00000000);
    tick(10, animation);
    expect(animation.getTranslatedOnLine(0, 0)).toEqual(0b00000000);
    expect(animation.getTranslatedOnLine(0, 1)).toEqual(0b00000000);
    tick(10, animation);
    expect(animation.getAnimationRemaining()).toEqual(0);
  });
  it('should stop on the last line when specified', () => {
    let source : any = new Uint8Array(18)
      .fill(parseInt("11111111", 2), 0, FRAME_WIDTH)
      .fill(parseInt("10101111", 2), FRAME_WIDTH);
    source.annotations = [new LinebreakAnnotation(FRAME_WIDTH + 1, FRAME_WIDTH + 1, 'Soft')];
    let animation = new VerticalScrollingAnimation(2, 10);
    animation.setSource(source, FRAME_WIDTH, 2);
    let scrollToLine2 = function () {
      const numPixels = 8 + 2 + 8 + 8 + 2 + 2;
      tick(numPixels, animation);
    };
    scrollToLine2();
    expect(animation.getTranslatedOnLine(0, 0)).toEqual(0b10101111);
    tick(10, animation);
    expect(animation.getTranslatedOnLine(0, 0)).toEqual(0b10101111);
    console.log("animation.getAnimationRemaining() = ", animation.getAnimationRemaining());
    expect(animation.getAnimationRemaining()).toEqual(0);
  });
  describe('no scrollIn', () => {
    it('should start on line 1 when scrollIn = false in a multiline', () => {
      let source : any = new Uint8Array(18)
        .fill(parseInt("11111111", 2), 0, FRAME_WIDTH)
        .fill(parseInt("10101111", 2), FRAME_WIDTH);
      source.annotations = [new LinebreakAnnotation(FRAME_WIDTH + 1, FRAME_WIDTH + 1, 'Soft')];
      let animation = new VerticalScrollingAnimation(2, 10, undefined, false);
      animation.setSource(source, FRAME_WIDTH, 2);
      expect(animation.getTranslatedOnLine(0, 0)).toEqual(0b11111111);
      tick(3, animation);
      expect(animation.getTranslatedOnLine(0, 0)).toEqual(0b11111110);
      tick(9, animation);
      expect(animation.getTranslatedOnLine(0, 0)).toEqual(0b10101111);
      tick(28, animation);
      expect(animation.getAnimationRemaining()).toEqual(0);

    });
    it('should start on line 1 when scrollIn = false in a single line', () => {
      let source : any = new Uint8Array(9)
        .fill(parseInt("11111111", 2), 0, FRAME_WIDTH);
      source.annotations = [];
      let animation = new VerticalScrollingAnimation(2, 10, undefined, false);
      animation.setSource(source, FRAME_WIDTH, 1);
      expect(animation.getTranslatedOnLine(0, 0)).toEqual(0b11111111);
      tick(3, animation);
      expect(animation.getTranslatedOnLine(0, 0)).toEqual(0b11111110);
      tick(9, animation);
      expect(animation.getTranslatedOnLine(0, 0)).toEqual(0b00000000);
      tick(6, animation);
      expect(animation.getAnimationRemaining()).toEqual(0);
    });

  });
  describe('no scrollOut', () => {
    it('should end on line 2 when scrollOut = false in a multiline', () => {
      let source : any = new Uint8Array(18)
        .fill(parseInt("11111111", 2), 0, FRAME_WIDTH)
        .fill(parseInt("10101111", 2), FRAME_WIDTH);
      source.annotations = [new LinebreakAnnotation(FRAME_WIDTH + 1, FRAME_WIDTH + 1, 'Soft')];
      let animation = new VerticalScrollingAnimation(2, 10, undefined, true, false);
      animation.setSource(source, FRAME_WIDTH, 2);
      expect(animation.getTranslatedOnLine(0, 0)).toEqual(0b00000000);
      tick(30, animation);
      expect(animation.getTranslatedOnLine(0, 0)).toEqual(0b10101111);
      tick(10, animation);
      expect(animation.getAnimationRemaining()).toEqual(-18);
    });
    it('should not scroll out a single line', () => {
      let source : any = new Uint8Array(9)
        .fill(parseInt("11111111", 2), 0, FRAME_WIDTH);
      source.annotations = [];
      let animation = new VerticalScrollingAnimation(2, 10, undefined, true, false);
      animation.setSource(source, FRAME_WIDTH, 1);
      expect(animation.getTranslatedOnLine(0, 0)).toEqual(0b00000000);
      tick(8, animation);
      expect(animation.getTranslatedOnLine(0, 0)).toEqual(0b11111111);
      tick(10, animation);
      expect(animation.getAnimationRemaining()).toEqual(-8);
    });


  });
});
