const expect = require("chai").expect;

const IcsScheduleProvider = require("./IcsScheduleProvider");
const PreemptiveCache = require("../fetch/Mock-PreemptiveCache");
const moment = require("moment");
const Entur = require("../Entur.js");

describe('IcsScheduleProvider.spec.js', () => {
    it('should process ICS file, and notice the updated event on second prepareNext', function(done) {
        this.timeout(10000);
        let calendarEventsJson = require('../testdata/basic-1.json');
        let dataStore = new PreemptiveCache({"testsubject-fetcher": calendarEventsJson});
        let messageProviderFactory = new Entur.factory(dataStore, {
            graphQLFetcherFactory : () => () => Promise.resolve(require("../testdata/entur-response-1.json"))
        });
        const icsScheduleProvider = new IcsScheduleProvider("testsubject", dataStore, "http://notimportant", messageProviderFactory);
        dataStore._runFetchers().then(() => {

            icsScheduleProvider.prepareNext(moment("20180606T221344Z"))
                .then(changeset => {
                    expect(changeset.added).to.have.lengthOf(1);
                    icsScheduleProvider.executeNext(changeset);
                    expect(icsScheduleProvider.getCurrentProviders()).to.have.lengthOf(1);
                    expect(icsScheduleProvider.getCurrentProviders()[0].getMessage()).to.have.lengthOf(3);
                    calendarEventsJson[0] = {...calendarEventsJson[0]};
                    calendarEventsJson[0].lastModified = "2018-06-05T07:59:06Z";
                    calendarEventsJson[0].summary = "Run 2";
                    icsScheduleProvider.prepareNext(moment("20180606T221345Z"))
                        .then(changeset => {
                            expect(changeset.added).to.have.lengthOf(0);
                            expect(changeset.updated).to.have.lengthOf(1);
                            icsScheduleProvider.executeNext(changeset);
                            expect(icsScheduleProvider.getCurrentProviders()).to.have.lengthOf(1);
                            expect(icsScheduleProvider.getCurrentProviders()[0].getMessage()).to.have.lengthOf(3);
                            done();
                        })
                        .catch(err => console.error(err));
                })
                .catch(err => console.error(err));

        });
    });
});
