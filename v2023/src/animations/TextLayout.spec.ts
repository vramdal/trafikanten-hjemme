import { LinebreakAnnotation } from "../rendering/LinebreakAnnotation";

import { TextLayout } from "./TextLayout";

describe('TextLayout', () => {

  describe('soft breaks', () => {

    it('should not introduce soft linebreaks when no overflow', () => {
      let source: any = Uint8Array.of(1, 2, 3);
      source.annotations = [new LinebreakAnnotation(2, 2)];
      let textlayout = new TextLayout(source, 3);
      expect(textlayout.pages).toHaveLength(2);
    });

    it('should introduce soft linebreaks when overflow', () => {
      let source: any = Uint8Array.of(1, 2, 3);
      source.annotations = [new LinebreakAnnotation(2, 2)];
      let textlayout = new TextLayout(source, 2);
      expect(textlayout.pages).toHaveLength(2);
    });

    it('should cut off when there\'s not enough space on a line', () => {
      let source: any = Uint8Array.of(1, 2, 3, 4);
      source.annotations = [new LinebreakAnnotation(1, 1)];
      let textlayout = new TextLayout(source, 2);
      expect(textlayout.pages).toHaveLength(2);
      expect(textlayout.pages[0]).toMatchObject({'0': 1, '1': 0});
      expect(textlayout.pages[1]).toMatchObject({'0': 2, '1': 3});

      expect(textlayout._overflows[0]).toBeUndefined();
      expect(textlayout._overflows[1]).toMatchObject({'0': 4});
    });

    it('should break into multiple lines AND overflow when necessary', () => {
      let source: any = Uint8Array.of(1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14);
      source.annotations = [new LinebreakAnnotation(2, 3), new LinebreakAnnotation(5, 6), new LinebreakAnnotation(13, 13)];
      let textlayout = new TextLayout(source, 2);
      expect(textlayout.pages).toHaveLength(4);
      expect(textlayout.pages[0]).toMatchObject({'0': 1, '1': 2});
      expect(textlayout.pages[1]).toMatchObject({'0': 4, '1': 5});
      expect(textlayout.pages[2]).toMatchObject({'0': 7, '1': 8});
      expect(textlayout.pages[3]).toMatchObject({'0': 14, '1': 0});

      expect(textlayout._overflows[0]).toMatchObject({'0': 3});
      expect(textlayout._overflows[1]).toMatchObject({'0': 6});
      expect(textlayout._overflows[2]).toMatchObject({'0': 9, '1': 10, '2': 11, '3': 12, '4': 13});
      expect(textlayout._overflows[3]).toBeUndefined();
    });
  });

  describe('Hard line breaks', () => {
    it('should break on a hard line break', () => {
      let source: any = Uint8Array.of(1, 2, 3, 4);
      source.annotations = [new LinebreakAnnotation(1, 1, "Hard")];
      let textlayout = new TextLayout(source, 2);
      expect(textlayout.pages).toHaveLength(2);
      expect(textlayout.pages[0]).toMatchObject({'0': 1, '1': 0});
      expect(textlayout.pages[1]).toMatchObject({'0': 2, '1': 3});

      expect(textlayout._overflows[0]).toBeUndefined();
      expect(textlayout._overflows[1]).toMatchObject({'0': 4});
    });

    it('should respect hard breaks AND break on soft break when necessary', () => {
      let source: any = Uint8Array.of(1, 2, 3, 4);
      source.annotations = [new LinebreakAnnotation(1, 1, "Hard"), new LinebreakAnnotation(2, 3, "Soft")];
      let textlayout = new TextLayout(source, 2);
      expect(textlayout.pages).toHaveLength(2);
      expect(textlayout.pages[0]).toMatchObject({'0': 1, '1': 0});
      expect(textlayout.pages[1]).toMatchObject({'0': 2, '1': 3});

      expect(textlayout._overflows[0]).toBeUndefined();
      expect(textlayout._overflows[1]).toMatchObject({'0': 4});
    });

  });


});
