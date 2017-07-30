// @flow
const expect = require("chai").expect;

const PreemptiveCache = require("./PreemptiveCache.js");
import type {ContentFetcher} from "./ContentFetcher";
import type {FetchError} from "./PreemptiveCache.js";

const FETCH_INTERVAL_SECONDS = 1;

describe('PreemptiveCache', () => {

    let preemptiveCache : PreemptiveCache;

    const contentFetcherConstructor = function(id : string) {

        this.fetched = [];

        "use strict";
        this.fetch = () => {
            "use strict";
            let value = `${this.id} - ${this.fetched.length + 1}`;
            this.fetched.push(value);
            return Promise.resolve(value);
        };
        this.format = () => {};
        this.fetchIntervalSeconds = FETCH_INTERVAL_SECONDS;
        this.id = id;
        this.maxErrorCount = 3;
    } ;

    let contentFetcher : ContentFetcher<string> & {fetched : Array<string>} = new contentFetcherConstructor("content-fetcher-1");


    beforeEach(() => {
        preemptiveCache = new PreemptiveCache();
    });
    
    describe('_runFetchers', () => {

        let fetcher1;
        let fetcher2;

        beforeEach(() => {
            fetcher1 = new contentFetcherConstructor("fetcher-1");
            fetcher2 = new contentFetcherConstructor("fetcher-2");
            fetcher1.fetchIntervalSeconds = 0;
            fetcher2.fetchIntervalSeconds = 0;
            preemptiveCache.registerFetcher(fetcher1);
            preemptiveCache.registerFetcher(fetcher2);

        });

        it('should run registered fetchers that are stale and not already running', () => {
            preemptiveCache._runFetchers();
            expect(fetcher1.fetched).to.have.lengthOf(1);
            expect(fetcher2.fetched).to.have.lengthOf(1);
        });
        it('should run only fetchers that are not already running', () => {
            fetcher1.fetch = () => new Promise(() => {});
            preemptiveCache._runFetchers();
            setTimeout(() => {
                preemptiveCache._runFetchers();
                expect(fetcher1.fetched).to.have.lengthOf(0);
                expect(fetcher2.fetched).to.have.lengthOf(2);
            }, 100);
        });
        it('should run only fetchers that have passed their time for update', () => {
            fetcher1.fetchIntervalSeconds = 100;
            preemptiveCache._runFetchers();
            preemptiveCache._runFetchers();
            setTimeout(() => {
                preemptiveCache._runFetchers();
                expect(fetcher1.fetched).to.have.lengthOf(1);
                expect(fetcher2.fetched).to.have.lengthOf(2);
            }, 100);

        });
    });


    describe('registration', () => {
        it('should register a fetcher and not run it yet', () => {
            preemptiveCache.registerFetcher(contentFetcher);
            expect(contentFetcher.fetched).to.have.lengthOf(0);
            expect(preemptiveCache._fetchers).to.have.lengthOf(1);
            expect(preemptiveCache.isStarted).to.be.false();
        });
        it('should register a fetcher and run it if started', () => {
            preemptiveCache.start();
            preemptiveCache.registerFetcher(contentFetcher);
            expect(contentFetcher.fetched).to.have.lengthOf(1);
            expect(preemptiveCache._fetchers).to.have.lengthOf(1);
            expect(preemptiveCache.isStarted).to.be.true();
        });
        it('should run registered fetchers when started', (done) => {
            preemptiveCache.registerFetcher(contentFetcher);
            preemptiveCache.start();
            expect(contentFetcher.fetched).to.have.lengthOf(2);
            setTimeout(() => {
                "use strict";
                expect(contentFetcher.fetched).to.have.lengthOf(2);
                done();
            }, FETCH_INTERVAL_SECONDS + 1);

        });
        it('should remove a fetcher when unregistered', () => {
            preemptiveCache.registerFetcher(contentFetcher);
            const fetcher2 = new contentFetcherConstructor("content-fetcher-2");
            preemptiveCache.registerFetcher(fetcher2);
            preemptiveCache.unregisterFetcher(contentFetcher);
            preemptiveCache.start();
            expect(contentFetcher.fetched).to.have.lengthOf(2);
            expect(fetcher2.fetched).to.have.lengthOf(1);
        });
    });
    
    describe('getValue', () => {

        let fetcher1;
        let fetcher2;

        beforeEach(() => {
            fetcher1 = new contentFetcherConstructor("content-fetcher-1");
            fetcher2 = new contentFetcherConstructor("content-fetcher-2");
            preemptiveCache.registerFetcher(fetcher1);
            preemptiveCache.registerFetcher(fetcher2);
            preemptiveCache.start();
        });

        it('should return the value for a fetcher', (done) => {
            const promise = preemptiveCache.getValue(fetcher1);
            expect(fetcher1.fetched).to.have.lengthOf(1);
            promise.then((value) => {
                "use strict";
                expect(value).to.equal(fetcher1.fetched[0]);
                done();
            });
        });
        
        it('should return the already fetched value', (done) => {
            const firstPromise = preemptiveCache.getValue(fetcher1);
            expect(fetcher1.fetched).to.have.lengthOf(1);
            firstPromise.then((value) => {
                "use strict";
                expect(value).to.equal(fetcher1.fetched[0]);
            });
            const secondPromise = preemptiveCache.getValue(fetcher1);
            expect(fetcher1.fetched).to.have.lengthOf(1);
            secondPromise.then(value => {
                "use strict";
                expect(value).to.equal(fetcher1.fetched[0]);
                done();
            });
        });
        
        it('should run the fetcher if we have no previous value', (done) => {
            let fetcher3 = new contentFetcherConstructor("content-fetcher-3");
            preemptiveCache.registerFetcher(fetcher3);
            expect(fetcher3.fetched).to.have.lengthOf(1);
            const firstPromise = preemptiveCache.getValue(fetcher3);
            expect(fetcher3.fetched).to.have.lengthOf(1);
            firstPromise.then(value => {
                "use strict";
                expect(value).to.equal(fetcher3.fetched[0]);
                done();
            });
        });
        
        it('should throw an error when getting a value for unregistered fetcher', () => {
            let fetcher3 = new contentFetcherConstructor("content-fetcher-3");
            expect(preemptiveCache.getValue.bind(preemptiveCache, fetcher3)).to.throw(`Fetcher ${fetcher3.id} not registered`);
        });
    });
    
    describe('error handling', () => {
        let fetcher1;

        beforeEach(() => {
            fetcher1 = new contentFetcherConstructor("content-fetcher-1");
            preemptiveCache.registerFetcher(fetcher1);
            preemptiveCache.start();
        });

        it('should return last value if error', (done) => {
            setTimeout(() => {
                fetcher1.fetch = function () {
                    throw new Error("Some fetcher error");
                };
                fetcher1.fetchIntervalSeconds = 0;
                preemptiveCache._runFetcher(preemptiveCache._fetchers[0]);
                setTimeout(() => {
                    preemptiveCache.getValue(fetcher1).then(value => {
                        "use strict";
                        expect(preemptiveCache._fetchers[0].errorCount).to.equal(1);
                        expect(value).to.equal(fetcher1.fetched[0]);
                        done();
                    });
                }, 500);
            }, 500);
        });
        
        it('should return last value on reject', (done) => {
            setTimeout(() => {
                fetcher1.fetch = function () {
                    return Promise.reject("Rejection");
                };
                fetcher1.fetchIntervalSeconds = 0;
                preemptiveCache._runFetcher(preemptiveCache._fetchers[0]);
                setTimeout(() => {
                    "use strict";
                    preemptiveCache.getValue(fetcher1).then(value => {
                        "use strict";
                        expect(value).to.equal(fetcher1.fetched[0]);
                        done();
                    });
                }, 500);
            }, 500);
        });
        
        it('should reject when no more retries', (done) => {
            setTimeout(() => {
                fetcher1.fetch = function () {
                    throw new Error("Some error");
                };
                fetcher1.maxErrorCount = 1;
                preemptiveCache._runFetchers();
                setTimeout(() => {
                    preemptiveCache.getValue(fetcher1)
                        .then(() => {
                            throw new Error("Should have been rejected");
                        })
                        .catch((errObj: FetchError) => {
                            expect(errObj.lastGoodContent).to.equal("content-fetcher-1 - 1");
                            expect(errObj.error).to.equal("Error fetching content");
                            done();
                        });
                }, 500);
            }, 500);
        });
        
        it('should should give no lastGoodContent if nothing but failures', (done) => {
            let fetcher2 = new contentFetcherConstructor("content-fetcher-2");
            fetcher2.fetch = function () {
                throw new Error("Some error");
            };
            fetcher2.maxErrorCount = 1;
            preemptiveCache.registerFetcher(fetcher2);
            setTimeout(() => {
                preemptiveCache._runFetchers();
                setTimeout(() => {
                    preemptiveCache.getValue(fetcher2)
                        .then(() => {
                            throw new Error("Should have been rejected");
                        })
                        .catch((errObj: FetchError) => {
                            expect(errObj).to.not.have.property("lastGoodContent");
                            expect(errObj.error).to.equal("Error fetching content");
                            done();
                        });
                }, 500);

            }, 500);
        });
    });

});

