// @flow

import type {FetcherSpec} from "./PreemptiveCache";

const base = require("./PreemptiveCache.js");

import type {Cache} from "./Cache";

class PreemptiveCache extends base implements Cache<string, *> {

    contents: {[fetcherId : string] : *};

    constructor(contents: { [p: string]: * }) {
        super();
        this.contents = contents;
    }

    doFetch<V>(fetcherSpec: FetcherSpec<V>): Promise<V> {
        return Promise.resolve(this.contents[fetcherSpec.id]);
    }
}

module.exports = PreemptiveCache;