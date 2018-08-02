let expect = require("chai").expect;

let met = require("./Met.js");

let fs = require("fs");
let xml2json = require("xml2json");

const testdata = fs.readFileSync("./testdata/met-forecast-1.xml", {encoding: "utf-8"}) ;

describe('Met', () => {
    describe('aggregate', () => {
        it('should aggregate met.no forecast xml', (done) => {
            Promise.resolve(xml2json.toJson(testdata))
                .then(json => JSON.parse(json))
                .then(json => Object.assign({}, json, {status: "OK"}))
                .then(json => {
                    const aggregated = met._testing.aggregate(json.weatherdata.product.time);
                    console.log("aggregated", aggregated);
                    done();
                });
        });

    })
});
