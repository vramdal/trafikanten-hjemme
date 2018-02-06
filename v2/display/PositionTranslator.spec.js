const expect = require("chai").expect;

const PositionTranslator = require("./PositionTranslator.js");

describe('PositionTranslator', () => {

    describe('simple', () => {

        const positionTranslator = new PositionTranslator(5, 18).translate;

        it("should translate a simple set of coordinates", () => {
            expect(positionTranslator(0, 0)).to.eql({x: 0, y: 0});
        });
        it('should translate a bit to next line', () => {
            expect(positionTranslator(0, 8)).to.eql({x: 5, y: 0});
        });
        it('should not accept too wide', () => {
            let func = positionTranslator.bind(null, 5, 0);
            expect(func).to.throw();
        });
        it('should not accept too high', () => {
            let func = positionTranslator.bind(null, 0, 18);
            expect(func).to.throw();
        });

    });
    
    describe('wedges', () => {
        const positionTranslator = new PositionTranslator(128, 18, [{x: 0, y: 8, width: 128, height: 2}]).translate;
        it('should assume wedge area is writeable', () => {
            expect(positionTranslator(0, 8)).to.be.null();
        });
        it('should insert the wedge', () => {
            expect(positionTranslator(0, 10)).to.eql({x: 128, y: 0});
        });
    });

});