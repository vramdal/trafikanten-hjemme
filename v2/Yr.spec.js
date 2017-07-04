let expect = require("chai").expect;

let Yr = require("./Yr");

describe('Yr', () => {
    it('should fetch data', (done) => {
       const yr = new Yr();
       yr.fetch(() => {done()})
    }).timeout(10000);
});