let moment = require("moment");

let expect = require("chai").expect;

let met = require("./Met.js");

let fs = require("fs");
let xml2json = require("xml2json");

const testdata = fs.readFileSync("./testdata/met-forecast-1.xml", {encoding: "utf-8"}) ;

describe('Met', () => {
    describe('aggregate', () => {
        xit('should aggregate met.no forecast xml', (done) => {
            Promise.resolve(xml2json.toJson(testdata))
                .then(json => JSON.parse(json))
                .then(json => {
                    //console.log("json", JSON.stringify(json, undefined, 3));
                    return json;
                })
                .then(json => Object.assign({}, json, {status: "OK"}))
                .then(json => {
                    const aggregated = met._testing.aggregate(json.weatherdata.product.time, moment("2018-08-01T14:30:00Z"));
                    expect(aggregated).to.be.a('array');
                    expect(aggregated).to.have.lengthOf(4);
                    function testPeriod(period, timeStr, periodName, temperatureObj, symbolObj) {
                        expect(period).to.have.property('period', periodName);
                        expect(period).to.have.property('time');
                        expect(period.time.isSame(moment(timeStr))).to.equal(true);
                        expect(period).to.have.property('temperature');
                        expect(period.temperature).to.deep.equal(temperatureObj);
                        expect(period).to.have.property('symbol');
                        expect(period.symbol).to.deep.equal(symbolObj);
                    }
                    testPeriod(aggregated[0], "2018-08-01T16:00:00Z", 'EVENING', {id: 'TTT', unit: 'celsius', value: '23.3'}, {
                        id: 'LightCloud',
                        number: 2
                    });
                    testPeriod(aggregated[1], '2018-08-01T22:00:00Z', 'NIGHT', {id: 'TTT', unit: 'celsius', value: '17.4'}, {
                        id: 'Sun',
                        number: 1
                    });
                    testPeriod(aggregated[2], "2018-08-02T04:00:00Z", 'MORNING', {id: 'TTT', unit: 'celsius', value: '14.5'}, {
                        id: 'PartlyCloud',
                        number: 3
                    });
                    testPeriod(aggregated[3], "2018-08-02T10:00:00Z", 'DAY', {id: 'TTT', unit: 'celsius', value: '20.1'}, {
                        id: 'Cloud',
                        number: 4
                    });
                    done();
                });
        });

    })
});
