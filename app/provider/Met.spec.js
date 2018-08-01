let expect = require("chai").expect;

let met = require("./Met.js");

const testdata = require("../testdata/met-forecast-1.xml");

describe('Met', () => {
    describe('aggregate', () => {
        it('should aggregate met.no forecast xml', (done) => {
            Promise.resolve(xml2json.toJson(testdata))
                .then(json => JSON.parse(json))
                .then(json => Object.assign({}, json, {status: "OK"}))
                .then(json => {
                    const aggregated = met._testing.aggregate(json);
                    console.log("aggregated", aggregated);
                    done();
                });
        });

    })
});
