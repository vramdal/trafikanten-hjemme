// @flow

const NodeCache = require( "node-cache" );

export interface Cache<Key, Value> {

    getValue(key : Key) : Promise<Value>;

}

export type CachedValueProvider<V> = () => Promise<V>;

class CachedFetcher<Key, Value> {

    cache : NodeCache;
    fetcher : (key : Key) => Promise<Value>;

    constructor(options : {}, fetcher: (key : Key) => Promise<Value>) {
        this.cache = new NodeCache(options);
        this.fetcher = fetcher;
    }

    getValue(key : Key) : Promise<Value> {
        let cached : Value = this.cache.get(key);
        if (cached === undefined) {
            return this.fetcher(key).then((value) => {
                this.cache.set(key, value);
                return Promise.resolve(value);
            });
        } else {
            return Promise.resolve(cached);
        }
    }
}

module.exports = {CachedFetcher};