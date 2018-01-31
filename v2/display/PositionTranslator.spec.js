const expect = require("chai").expect;

const PositionTranslator = require("./PositionTranslator.js");

describe('PositionTranslator', () => {

    describe('simple', () => {

        const positionTranslator = new PositionTranslator(5, 9).translate;

        it("should translate a simple set of coordinates", () => {
            expect(positionTranslator(0, 0)).to.have.members([0, 0]);
        });
        it('should translate a bit to next line', () => {
           expect(positionTranslator(0, 8)).to.have.members([5, 0]);
        });
        it('should not accept too wide', () => {
            let func = positionTranslator.bind(null, 5, 0);
           expect(func).to.throw();
        });
        it('should not accept too high', () => {
            let func = positionTranslator.bind(null, 0, 9);
           expect(func).to.throw();
        });

    });

});