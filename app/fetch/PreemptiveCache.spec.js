// @flow
const expect = require("chai").expect;

const PreemptiveCache = require("./PreemptiveCache.js");
import type {ContentFetcher} from "./ContentFetcher";
import type {FetchError} from "./PreemptiveCache.js";

const FETCH_INTERVAL_SECONDS = 1;
const MAX_ERROR_COUNT = 3;

describe('PreemptiveCache', () => {

    let preemptiveCache : PreemptiveCache;

    const ContentFetcherWrapper = function(id : string) {

        this.fetched = [];
        this.id = id;

        this.fetch = function() {
            let value = `${this.id} - ${this.fetched.length + 1}`;
            this.fetched.push(value);
            return Promise.resolve(value);
        }.bind(this);
    } ;

    let contentFetcher : {fetched : Array<string>, id : string, fetch : ContentFetcher<string>} = new ContentFetcherWrapper("content-fetcher-1");


    beforeEach(() => {
        preemptiveCache = new PreemptiveCache();
    });
    
    describe('_runFetchers', () => {

        let fetcher1;
        let fetcher2;

        beforeEach(() => {
            fetcher1 = new ContentFetcherWrapper("fetcher-1");
            fetcher2 = new ContentFetcherWrapper("fetcher-2");
            preemptiveCache.registerFetcher(fetcher1.fetch, fetcher1.id, 0);
            preemptiveCache.registerFetcher(fetcher2.fetch, fetcher2.id, 0);

        });

        it('should run registered fetchers that are stale and not already running', (done) => {
            preemptiveCache._runFetchers().then(() => {
                expect(fetcher1.fetched).to.have.lengthOf(1);
                expect(fetcher2.fetched).to.have.lengthOf(1);
                done();
            });
        });
        it('should run only fetchers that are not already running', (done) => {
            fetcher1.fetch = () => new Promise((resolve) => {
                setTimeout(() => resolve(), 1);

            });
            preemptiveCache.registerFetcher(fetcher1.fetch, fetcher1.id, 0);
            preemptiveCache._runFetchers().then(() => {
                preemptiveCache._runFetchers().then(() => {
                    expect(fetcher1.fetched).to.have.lengthOf(0);
                    expect(fetcher2.fetched).to.have.lengthOf(2);
                    done();

                });
            });
        });

        it('should run only fetchers that have passed their time for update', (done) => {
            preemptiveCache._runFetchers();
            preemptiveCache._fetchers[0].fetchIntervalSeconds = 10;
            preemptiveCache._runFetchers().then(() => {
                preemptiveCache._runFetchers();
                expect(fetcher1.fetched).to.have.lengthOf(1);
                expect(fetcher2.fetched).to.have.lengthOf(2);
                done();
            });

        });
    });


    describe('registration', () => {
        it('should register a fetcher and not run it yet', () => {
            preemptiveCache.registerFetcher(contentFetcher.fetch, contentFetcher.id, FETCH_INTERVAL_SECONDS);
            expect(contentFetcher.fetched).to.have.lengthOf(0);
            expect(preemptiveCache._fetchers).to.have.lengthOf(1);
            expect(preemptiveCache.isStarted).to.be.false();
        });
        it('should register a fetcher and run it if started', () => {
            preemptiveCache.start();
            preemptiveCache.registerFetcher(contentFetcher.fetch, contentFetcher.id, FETCH_INTERVAL_SECONDS);
            expect(contentFetcher.fetched).to.have.lengthOf(1);
            expect(preemptiveCache._fetchers).to.have.lengthOf(1);
            expect(preemptiveCache.isStarted).to.be.true();
        });
        it('should run registered fetchers when started', (done) => {
            preemptiveCache.registerFetcher(contentFetcher.fetch, contentFetcher.id, FETCH_INTERVAL_SECONDS);
            preemptiveCache.start();
            expect(contentFetcher.fetched).to.have.lengthOf(2);
            setTimeout(() => {
                "use strict";
                expect(contentFetcher.fetched).to.have.lengthOf(2);
                done();
            }, FETCH_INTERVAL_SECONDS + 1);

        });
        it('should remove a fetcher when unregistered', () => {
            preemptiveCache.registerFetcher(contentFetcher.fetch, contentFetcher.id, FETCH_INTERVAL_SECONDS);
            const fetcher2 = new ContentFetcherWrapper("content-fetcher-2");
            preemptiveCache.registerFetcher(fetcher2.fetch, fetcher2.id, FETCH_INTERVAL_SECONDS);
            preemptiveCache.unregisterFetcher(contentFetcher.id);
            preemptiveCache.start();
            expect(contentFetcher.fetched).to.have.lengthOf(2);
            expect(fetcher2.fetched).to.have.lengthOf(1);
        });
    });
    
    describe('getValue', () => {

        let fetcher1;
        let fetcher2;

        beforeEach(() => {
            fetcher1 = new ContentFetcherWrapper("content-fetcher-1");
            fetcher2 = new ContentFetcherWrapper("content-fetcher-2");
            preemptiveCache.registerFetcher(fetcher1.fetch, fetcher1.id, MAX_ERROR_COUNT);
            preemptiveCache.registerFetcher(fetcher2.fetch, fetcher2.id, MAX_ERROR_COUNT);
            preemptiveCache.start();
        });

        it('should return the value for a fetcher', (done) => {
            const promise = preemptiveCache.getValue(fetcher1.id);
            expect(fetcher1.fetched).to.have.lengthOf(1);
            promise.then((value) => {
                "use strict";
                expect(value).to.equal(fetcher1.fetched[0]);
                done();
            });
        });
        
        it('should return the already fetched value', (done) => {
            const firstPromise = preemptiveCache.getValue(fetcher1.id);
            expect(fetcher1.fetched).to.have.lengthOf(1);
            firstPromise.then((value) => {
                "use strict";
                expect(value).to.equal(fetcher1.fetched[0]);
            });
            const secondPromise = preemptiveCache.getValue(fetcher1.id);
            expect(fetcher1.fetched).to.have.lengthOf(1);
            secondPromise.then(value => {
                "use strict";
                expect(value).to.equal(fetcher1.fetched[0]);
                done();
            });
        });
        
        it('should run the fetcher if we have no previous value', (done) => {
            let fetcher3 = new ContentFetcherWrapper("content-fetcher-3");
            preemptiveCache.registerFetcher(fetcher3.fetch, fetcher3.id, MAX_ERROR_COUNT);
            expect(fetcher3.fetched).to.have.lengthOf(1);
            const firstPromise = preemptiveCache.getValue(fetcher3.id);
            expect(fetcher3.fetched).to.have.lengthOf(1);
            firstPromise.then(value => {
                "use strict";
                expect(value).to.equal(fetcher3.fetched[0]);
                done();
            });
        });
        
        it('should throw an error when getting a value for unregistered fetcher', () => {
            let fetcher3 = new ContentFetcherWrapper("content-fetcher-3");
            expect(preemptiveCache.getValue.bind(preemptiveCache, fetcher3.id)).to.throw(`Fetcher ${fetcher3.id} not registered`);
        });
    });
    
    describe('error handling', () => {
        let fetcher1;

        beforeEach(() => {
            fetcher1 = new ContentFetcherWrapper("content-fetcher-1");
            preemptiveCache.registerFetcher(fetcher1.fetch, fetcher1.id, FETCH_INTERVAL_SECONDS, MAX_ERROR_COUNT);
        });

        it('should return last value if error', (done) => {
            let firstValue = "first value fetched";
            fetcher1.fetch = function () {
                if (fetcher1.fetched.length > 0) {
                    throw new Error("Some error");
                } else {
                    fetcher1.fetched.push(firstValue);
                    return Promise.resolve(firstValue);
                }
            };
            preemptiveCache.registerFetcher(fetcher1.fetch, fetcher1.id, 0);
            const fetcherSpec = preemptiveCache._fetchers.find(fetcherSpec => fetcherSpec.id === fetcher1.id);
            if (!fetcherSpec) {
                throw new Error("Fetcher not registered");
            }
            preemptiveCache.start().then(() => {
                preemptiveCache._runFetchers().then(() => {
                    preemptiveCache.getValue(fetcher1.id).then(value => {
                        "use strict";
                        expect(preemptiveCache._fetchers[0].errorCount).to.equal(1);
                        expect(value).to.equal(fetcher1.fetched[0]);
                        done();
                    });
                });
            });
        });
        
        it('should return last value on reject', (done) => {
            let fetcher2 = new ContentFetcherWrapper("content-fetcher-2");
            let firstValue = "first value fetched";
            fetcher2.fetch = function () {
                if (fetcher2.fetched.length > 0) {
                    return Promise.reject("Rejection");
                } else {
                    fetcher2.fetched.push(firstValue);
                    return Promise.resolve(firstValue);
                }
            };
            preemptiveCache.registerFetcher(fetcher2.fetch, fetcher2.id, FETCH_INTERVAL_SECONDS, 0);
            preemptiveCache.start().then(() => {
                preemptiveCache._runFetchers().then(() => {
                    preemptiveCache.getValue(fetcher2.id).then(value => {
                        expect(value).to.equal(fetcher2.fetched[0]);
                        done();
                    });
                });
            });
        });
        
        it('should reject when no more retries', (done) => {
            let fetcher2 = new ContentFetcherWrapper("content-fetcher-2");
            fetcher2.fetch = function () {
                throw new Error("Some error");
            };
            preemptiveCache.registerFetcher(fetcher2.fetch, fetcher2.id, 0, 1);
            preemptiveCache._fetchers[1].content = "content-fetcher-2 - 1";
            preemptiveCache.start().then(() => {
                preemptiveCache._runFetchers().then(() => {
                    preemptiveCache.getValue(fetcher2.id)
                        .then(() => {
                            throw new Error("Should have been rejected");
                        })
                        .catch((errObj: FetchError) => {
                            expect(errObj.lastGoodContent).to.equal("content-fetcher-2 - 1");
                            expect(errObj.error).to.equal("Error fetching content");
                            done();
                        });
                }).catch(err => {
                    console.error("err")
                });
            });
        });
        
        it('should should give no lastGoodContent if nothing but failures', (done) => {
            let fetcher2 = new ContentFetcherWrapper("content-fetcher-2");
            fetcher2.fetch = function () {
                throw new Error("Some error");
            };
            preemptiveCache.registerFetcher(fetcher2.fetch, fetcher2.id, FETCH_INTERVAL_SECONDS, 1);
            preemptiveCache.start().then(() => {
                preemptiveCache._runFetchers().then(() => {
                    "use strict";
                    preemptiveCache.getValue(fetcher2.id)
                        .then(() => {
                            throw new Error("Should have been rejected");
                        })
                        .catch((errObj: FetchError) => {
                            expect(errObj).to.not.have.property("lastGoodContent");
                            expect(errObj.error).to.equal("Error fetching content");
                            done();
                        });
                });
            });
        });
    });

});

