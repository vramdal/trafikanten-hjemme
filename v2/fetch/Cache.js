// @flow

export interface Cache<Key, Value> {

    getValue(key : Key) : Promise<Value>;

}

export type CachedValueProvider<V> = () => Promise<V>;

