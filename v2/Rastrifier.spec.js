let expect = require("chai").expect;

let Rastrifier = require('./Rastrifier');

const logBitmap = require('./BitmapUtil').logBitmap;

describe('Rastrifier', () => {
    it('should raster a simple message', () => {
        let message = "Hello world!";
        let result = Rastrifier.rastrify(message);
        let hex = Buffer.from(result).toString('hex');

        expect(result[0]).to.equal(0x7e);
        expect(hex).to.equal("7e1010107e001c2a2a2a1800427e0200427e02001c2222221c00000000003c020c023c001c2222221c003e10202000427e02000c12127e0000007a0000");
        logBitmap(result);

    });
});