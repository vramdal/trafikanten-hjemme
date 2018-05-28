// @flow
import type {CachedValueProvider} from "../fetch/Cache";

const ValueFetcherAndFormatter = require("../fetch/ValueFetcherAndFormatter").ValueFetcherAndFormatter;
const IcalFetcher = require("../fetch/IcalFetcher");
const PreemptiveCache = require("../fetch/PreemptiveCache.js");
const IcalExpander = require("ical-expander");
const settings = require('../settings');

const fetchIntervalSeconds = 60;
const formatIntervalSeconds = 60;

type R = any;

type Schedule = any;

class IcalScheduleProvider {

    id : string;
    _valueFetcher : ValueFetcherAndFormatter<any>;

    _fetcher : () => Promise<IcalExpander>;
    _rawValueProvider : CachedValueProvider<IcalExpander>;
    _formattedValueProvider : CachedValueProvider<Schedule>;

    constructor(id : string, dataStore : PreemptiveCache) {
        let calendarUrl = settings.get("calendarUrl");
        this.id = id;
        this._fetcher = IcalFetcher(calendarUrl);
        this._rawValueProvider = dataStore.registerFetcher(this._fetcher, id + "-fetcher", fetchIntervalSeconds);
        this._formattedValueProvider = dataStore.registerFetcher(this.process.bind(this), id + "-formatter", formatIntervalSeconds);

        this._valueFetcher = new ValueFetcherAndFormatter(id,
            dataStore,
            this._fetcher,
            60,
            this.process.bind(this),
            60,
            [Object.assign({},
                {start: 0, end: 127, text: "Loading data for " + this.id, lines: 2},
                {animation: {animationName: "VerticalScrollingAnimation", holdOnLine: 50}})]
        );

    }

    //noinspection JSMethodCanBeStatic
    process(data : R) : Promise<Schedule> {
        console.log("data = ", data);
        /* TODO: Hva her? */
        return Promise.resolve();
    }
}

module.exports = IcalScheduleProvider;

