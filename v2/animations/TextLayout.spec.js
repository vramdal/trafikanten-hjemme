const LinebreakAnnotation = require("../rendering/LinebreakAnnotation.js");
const TextLayout = require("./TextLayout.js");
const expect = require("chai").expect;

describe('TextLayout', () => {

    it('should not introduce soft linebreaks when no overflow', () => {
        let source = Uint8Array.of(1, 2, 3);
        source.annotations = [new LinebreakAnnotation(2, 2)];
        let textlayout = new TextLayout(source, 3);
        expect(textlayout.pages).to.have.lengthOf(2);
    });

    it('should introduce soft linebreaks when overflow', () => {
        let source = Uint8Array.of(1, 2, 3);
        source.annotations = [new LinebreakAnnotation(2, 2)];
        let textlayout = new TextLayout(source, 2);
        expect(textlayout.pages).to.have.lengthOf(2);
    });

    it('should cut off when there\'s not enough space on a line', () => {
        let source = Uint8Array.of(1, 2, 3, 4);
        source.annotations = [new LinebreakAnnotation(1, 1)];
        let textlayout = new TextLayout(source, 2);
        expect(textlayout.pages).to.have.lengthOf(2);
        expect(textlayout.pages[0]).to.eql({'0': 1});
        expect(textlayout.pages[1]).to.eql({'0': 2, '1': 3});

        expect(textlayout._overflows[0]).to.be.undefined();
        expect(textlayout._overflows[1]).to.eql({'0': 4});
    });

    it('should break into multiple lines AND overflow when necessary', () => {
        let source = Uint8Array.of(1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14);
        source.annotations = [new LinebreakAnnotation(2, 3), new LinebreakAnnotation(5, 6), new LinebreakAnnotation(13, 13)];
        let textlayout = new TextLayout(source, 2);
        expect(textlayout.pages).to.have.lengthOf(4);
        expect(textlayout.pages[0]).to.eql({'0': 1, '1': 2});
        expect(textlayout.pages[1]).to.eql({'0': 4, '1': 5});
        expect(textlayout.pages[2]).to.eql({'0': 7, '1': 8});
        expect(textlayout.pages[3]).to.eql({'0': 14 });

        expect(textlayout._overflows[0]).to.eql({'0': 3});
        expect(textlayout._overflows[1]).to.eql({'0': 6});
        expect(textlayout._overflows[2]).to.eql({'0': 9, '1': 10, '2': 11, '3': 12, '4': 13});
        expect(textlayout._overflows[3]).to.be.undefined();
    });

});