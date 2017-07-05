const expect = require("chai").expect;
const bitmapTo8Lines = require('../BitmapUtil').bitmapTo8Lines;
const numToPaddedHex = require('../BitmapUtil').numToPaddedHex;
const getHexFingerprint = require('../BitmapUtil').getHexFingerprint;
const Frame = require("../Frame.js");
const printRuler = require('../BitmapUtil').printRuler;
const Scrolling = require("../animations/Scrolling.js");
const BitmapProxy = require("../BitmapProxy.js");

const PagingAnimation = require("./PagingAnimation.js");
const LinebreakAnnotation = require("../rendering/LinebreakAnnotation.js");

const FRAME_WIDTH = 16;


describe('PagingAnimation', () => {
    it('should display a short message as a single page', () => {
        let source = new Uint8Array(3).fill(2);
        source.annotations = [new LinebreakAnnotation(2, 3)];
        source[0] = 1;
        source[2] = 255;
        let animation = new PagingAnimation(2);
        animation.setSource(source, FRAME_WIDTH);
        animation.tick();
        expect(animation.isAnimationComplete()).to.equal(false);
        expect(animation.getAnimationRemaining()).to.equal(1);
        animation.tick();
        expect(animation.isAnimationComplete()).to.equal(true);
        expect(animation.getAnimationRemaining()).to.equal(0);
        expect(animation.getTranslated(0)).to.equal(source[0]);
        expect(animation.getTranslated(2)).to.equal(source[2]);
    });
    it('should break a long message in two lines per annotations', () => {
        let source = new Uint8Array(18).fill(2);
        source[0] = 1;
        source[6] = 255;
        source.annotations = [new LinebreakAnnotation(3, 5)];
        let animation = new PagingAnimation(2);
        animation.setSource(source, FRAME_WIDTH);
        expect(animation._pages).to.have.lengthOf(2);
    });
});