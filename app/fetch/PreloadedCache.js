// @flow

const PreemptiveCache = require('./PreemptiveCache');

import type {FetchServiceState} from './PreemptiveCache';

class PreloadedCache extends PreemptiveCache {

    constructor(stateObj : FetchServiceState) {
        super();
        this.loadState(stateObj);
    }


    start() : Promise<any> {
        return Promise.resolve();
    }

    stop() {
        // Ignore
    }

    loadState(stateObj : FetchServiceState) {
        this._fetchers = stateObj.fetchers.map(fetcherState => ({
                fetcher : () => Promise.resolve(fetcherState.content),
                lastFetchedSecond : fetcherState.lastFetchedSecond,
                content : fetcherState.content,
                lastError : fetcherState.lastError,
                isFetching : fetcherState.isFetching,
                errorCount : fetcherState.errorCount,
                maxErrorCount : fetcherState.maxErrorCount,
                id : fetcherState.id,
                fetchIntervalSeconds : fetcherState.fetchIntervalSeconds
            }
        ));
    }
}

module.exports = PreloadedCache;