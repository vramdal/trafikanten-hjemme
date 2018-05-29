// @flow

import type {ContentFetcher} from "./ContentFetcher";
import type {Cache, CachedValueProvider} from "./Cache";

type FetcherSpec<V> = {
    fetcher : ContentFetcher<V>,
    lastFetchedSecond : number,
    content : ?V,
    lastError? : FetchError,
    isFetching? : Promise<V>,
    errorCount : number,
    maxErrorCount : number,
    id : string,
    fetchIntervalSeconds : number
}

//const ERROR_FETCHER_HAS_NOT_BEEN_RUN_YET : string = "Fetcher has not been run yet";
const ERROR_NO_CONTENT : string  = "No content";
const ERROR_FETCHER : string = "Error fetching content";

export type FetchError = {
    error: string,
    lastGoodContent? : any
}

class PreemptiveCache implements Cache<string, *> {

    _timer : number;
    _fetchers : Array<FetcherSpec<*>>;
    _tick : number;
    _tickFrequence : number;

    constructor() {
        this._fetchers = [];
        this._tick = 0;
        this._timer = 0;
        this._tickFrequence = 1000;
    }

    start() {
        this.stop();
        const promise = this._runFetchers();
        this._timer = setInterval(this._runFetchers.bind(this), this._tickFrequence);
        return promise;
    }

    stop() {
        this._tick = 0;
        clearInterval(this._timer);
        this._timer = 0;
    }

    getValue<V>(fetcherId : string) : Promise<V> {
        return this.getContent(fetcherId);
    }

    getContent<V>(fetcherId : string) : Promise<V> {
        const existing  = ((this._fetchers.find(existing => existing.id === fetcherId): any) : FetcherSpec<V> );
        if (existing && existing.isFetching) {
            return existing.isFetching;
        } else if (existing && existing.errorCount > existing.maxErrorCount) {
            return Promise.reject(existing.lastError);
        } else if (existing && existing.content) {
            return Promise.resolve(existing.content);
        } else if (existing && (existing.content === null || existing.content === undefined)) {
            return Promise.reject(({error : ERROR_NO_CONTENT} ));
        } else {
            throw new Error(`Fetcher ${fetcherId} not registered`);
        }
    }

    get isStarted() : boolean {
        return this._timer !== 0;
    }

    registerFetcher<V>(fetcher : ContentFetcher<V>, id : string, fetchIntervalSeconds : number, maxErrorCount : number = 3) : CachedValueProvider<V> {
        let existingIndex = this._fetchers.findIndex(existing => existing.id === id);
        const fetcherSpec = (({
            fetcher: fetcher,
            lastFetchedSecond: -1,
            content: null,
            errorCount: 0,
            fetchIntervalSeconds,
            maxErrorCount,
            id
        }: any) : FetcherSpec<*>);
        if (existingIndex !== -1) {
            this._fetchers[existingIndex] = fetcherSpec;
        } else {
            this._fetchers.push(fetcherSpec);
            if (this.isStarted) {
                this._runFetcher(fetcherSpec);
            }
        }
        return () => this.getValue(id);
    }

    unregisterFetcher(id : string) {
        let existingIndex = this._fetchers.findIndex(existing => existing.id === id);
        if (existingIndex !== -1) {
            this._fetchers.splice(existingIndex, 1);
        }
    }

    _staleFetcherFilter(fetcherSpec : FetcherSpec<any>) {
        return fetcherSpec.lastFetchedSecond === -1 || fetcherSpec.lastFetchedSecond + fetcherSpec.fetchIntervalSeconds < this._tick;
    }

    _runFetchers() {
        this._tick++;
        let isNotAlreadyFetchingFilter = fetcherSpec => !fetcherSpec.isFetching;
        let promises = this._fetchers
            .filter(this._staleFetcherFilter.bind(this))
            .filter(isNotAlreadyFetchingFilter)
            .map(fetcherSpec => this._runFetcher(fetcherSpec))
            .map(PreemptiveCache.reflect);
        return Promise.all(promises);
    }

    static reflect(promise : Promise<any>) { // https://stackoverflow.com/questions/31424561/wait-until-all-es6-promises-complete-even-rejected-promises
        return promise
            .then(value => Promise.resolve(value))
            .catch(err => Promise.resolve(err));
    }

    getFetcherState(fetcherId : string) : boolean {
        let existingIndex = this._fetchers.findIndex(existing => existing.id === fetcherId);
        if (existingIndex === -1) {
            throw new Error("No fetcher with id " + fetcherId + " is registered");
        }
        if (fetcherSpec.content && fetcherSpec.errorCount === 0) {
            return "HAS_DATA";
        } else if (fetcherSpec.content && fetcherSpec.errorCount > 0) {
            return "HAS_DATA_AND_ERROR";
        } else if (!fetcherSpec.content && fetcherSpec.errorCount > 0) {
            return "FAILED";
        } else {
            return "NOT_RUN";
        }
    }

    _runFetcher<V>(fetcherSpec : FetcherSpec<V>) : Promise<V> {
        console.log(`Fetching ${fetcherSpec.id}`);
        fetcherSpec.isFetching = new Promise((resolve, reject) => {
            const errorhandler = (error : Error) => {
                console.error(`Error fetching ${fetcherSpec.id}. Retrying ${fetcherSpec.maxErrorCount - fetcherSpec.errorCount} more times.`, error);
                const errorObj : FetchError = {error: ERROR_FETCHER};
                //noinspection EqualityComparisonWithCoercionJS
                if (fetcherSpec.content != null) {
                    errorObj.lastGoodContent = fetcherSpec.content;
                }
                fetcherSpec.lastError = errorObj;
                fetcherSpec.errorCount++;
                delete fetcherSpec.isFetching;
                if (fetcherSpec.errorCount >= fetcherSpec.maxErrorCount) {
                    // TODO: Suspend? Blacklist?
                    fetcherSpec.errorCount = 0;
                    reject(errorObj)
                } else if (fetcherSpec.content) {
                    resolve(fetcherSpec.content);
                }
            };
            try {
                fetcherSpec.fetcher().then(data => {
                    console.log(`Fetched ${fetcherSpec.id}`);
                    fetcherSpec.content = data;
                    fetcherSpec.lastFetchedSecond = this._tick;
                    fetcherSpec.errorCount = 0;
                    delete fetcherSpec.isFetching;
                    resolve(fetcherSpec.content);
                }).catch(errorhandler);
            } catch (e) {
                errorhandler(e);
            }
        });
        return fetcherSpec.isFetching;
    }
}

module.exports = PreemptiveCache;