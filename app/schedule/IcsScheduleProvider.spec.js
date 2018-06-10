const expect = require("chai").expect;

const IcsScheduleProvider = require("./IcsScheduleProvider");
const PreemptiveCache = require("../fetch/Mock-PreemptiveCache");
const moment = require("moment");
const Entur = require("../provider/Entur.js");

let setup = function (calendarEventsJsonFilename) {
    let calendarEventsJson = require(calendarEventsJsonFilename);
    let dataStore = new PreemptiveCache({"testsubject-fetcher": calendarEventsJson});
    let messageProviderFactory = new Entur.factory(dataStore, {
        graphQLFetcherFactory: () => () => Promise.resolve(require("../testdata/entur-response-1.json"))
    });
    const icsScheduleProvider = new IcsScheduleProvider("testsubject", dataStore, "http://notimportant", messageProviderFactory);
    return {calendarEventsJson, dataStore, icsScheduleProvider};
};
describe('IcsScheduleProvider.spec.js', () => {
    it('should process ICS file, and notice the updated event on second prepareNext', function(done) {
        const {calendarEventsJson, dataStore, icsScheduleProvider} = setup('../testdata/basic-1.json');
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
    it('should remove messages from events that are no longer there', (done) => {
        let {calendarEventsJson, dataStore, icsScheduleProvider} = setup('../testdata/ical-with-expires-event.json');
        dataStore._runFetchers().then(() => {
            icsScheduleProvider.prepareNext(moment("2018-06-05T12:15:00.000Z")).then(changeset => {
                expect(changeset.added).to.have.lengthOf(1);
                icsScheduleProvider.executeNext(changeset);
                dataStore.set("testsubject-fetcher", calendarEventsJson.slice(0,1));
                dataStore._runFetchers(true).then(() => {
                    icsScheduleProvider.prepareNext(moment("2018-06-05T12:17:00.000Z")).then(changeset => {
                        expect(changeset.removed).to.have.lengthOf(1);
                        done();
                    })
                });
            });
        });
    });
});
