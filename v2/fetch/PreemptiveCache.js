// @flow

import type {ContentFetcher} from "./ContentFetcher";
import type {OptionalArrayOrSingleElement} from "../SimpleTypes";
import type {Cache, CachedValueProvider} from "./Cache";

type FetcherSpec<V> = {
    fetcher : ContentFetcher<V>,
    lastFetchedSecond : number,
    content : ?V,
    lastError? : any,
    isFetching? : Promise<V>,
    isError? : boolean
}


class PreemptiveCache implements Cache<ContentFetcher<*>, *> {

    _timer : number;
    _fetchers : Array<FetcherSpec<*>>;
    _tick : number;

    constructor() {
        this._fetchers = [];
        this._tick = 0;
    }

    start() {
        this.stop();
        this._runFetchers();
        this._timer = setInterval(this._runFetchers.bind(this), 1000);
    }

    stop() {
        this._tick = 0;
        clearInterval(this._timer);
    }

    getValue<V>(fetcher : ContentFetcher<V>) : Promise<V> {
        return this.getContent(fetcher);
    }

    getContent<V>(fetcher : ContentFetcher<V>) : Promise<V> {
        const existing  = ((this._fetchers.find(existing => existing.fetcher.id === fetcher.id): any) : FetcherSpec<V> );
        if (existing && existing.isFetching) {
            return existing.isFetching;
        } else if (existing && existing.content && !existing.isError) {
            return Promise.resolve(existing.content);
        } else if (existing) {
            return this._runFetcher(existing);
        } else {
            this.registerFetcher(fetcher);
            let registered = ((this._fetchers.find(existing => existing.fetcher.id === fetcher.id): any) : FetcherSpec<V>);
            if (registered === undefined || registered === null) {
                throw new Error(`Could not register fetcher ${fetcher.id}`)
            }
            return ((registered.isFetching: any) : Promise<V>);
        }
    }

    registerFetcher<V>(fetcher : ContentFetcher<V>) : CachedValueProvider<V> {
        let existingIndex = this._fetchers.findIndex(existing => existing.fetcher.id === fetcher.id);
        const fetcherSpec = (({fetcher: fetcher, lastFetchedSecond: -1, content: null}: any) : FetcherSpec<*>);
        if (existingIndex !== -1) {
            this._fetchers[existingIndex] = fetcherSpec;
        } else {
            this._fetchers.push(fetcherSpec);
            this._runFetcher(fetcherSpec);
        }
        return () => this.getValue(fetcher);
    }

    unregisterFetcher(fetcher : ContentFetcher<any>) {
        let existingIndex = this._fetchers.findIndex(existing => existing.fetcher.id === fetcher.id);
        if (existingIndex !== -1) {
            this._fetchers.splice(existingIndex, 1);
        }
    }

    _staleFetcherFilter(fetcherSpec : FetcherSpec<any>) {
        return fetcherSpec.lastFetchedSecond + fetcherSpec.fetcher.fetchIntervalSeconds < this._tick;
    }

    _runFetchers() {
        this._tick++;
        let isNotAlreadyFetchingFilter = fetcherSpec => !fetcherSpec.isFetching;
        this._fetchers
            .filter(this._staleFetcherFilter.bind(this))
            .filter(isNotAlreadyFetchingFilter)
            .forEach(fetcherSpec => {
                this._runFetcher(fetcherSpec)
                    .catch(() => {
                        console.error(`Error running scheduled fetch of ${fetcherSpec.fetcher.id}`);
                    })
            });
    }

    _runFetcher<V>(fetcherSpec : FetcherSpec<V>) : Promise<V> {
        console.log(`Fetching ${fetcherSpec.fetcher.id}`);
        fetcherSpec.isFetching = new Promise((resolve, reject) => {
            fetcherSpec.fetcher.fetch().then(data => {
                console.log(`Fetched ${fetcherSpec.fetcher.id}`);
                fetcherSpec.content = data;
                fetcherSpec.lastFetchedSecond = this._tick;
                resolve(fetcherSpec.content);
                delete fetcherSpec.isFetching;
                delete fetcherSpec.isError;
            }).catch((error : Error) => {
                console.error(`Error fetching ${fetcherSpec.fetcher.id}`, error);
                fetcherSpec.lastError = error;
                fetcherSpec.isError = true;
                reject({lastGoodContent: fetcherSpec.content, error: error});
                delete fetcherSpec.isFetching;
            });
        });
        return fetcherSpec.isFetching;
    }
}

module.exports = PreemptiveCache;