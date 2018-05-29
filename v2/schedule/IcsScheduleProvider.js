// @flow
import type {CachedValueProvider} from "../fetch/Cache";
import type {MessageProvider, MessageProviderIcalAdapter} from "../provider/MessageProvider";
import type {MessageType} from "../message/MessageType";
import type {PlaylistProvider} from "../provider/PlaylistProvider";

const ValueFetcherAndFormatter = require("../fetch/ValueFetcherAndFormatter").ValueFetcherAndFormatter;
const IcalFetcher = require("../fetch/IcalFetcher");
const PreemptiveCache = require("../fetch/PreemptiveCache.js");
const IcalExpander = require("ical-expander");

const fetchIntervalSeconds = 60;
const formatIntervalSeconds = 60;

type R = any;

class IcalScheduleProvider {

    id : string;
    _valueFetcher : ValueFetcherAndFormatter<any>;

    _fetcher : () => Promise<IcalExpander>;
    _rawValueProvider : CachedValueProvider<IcalExpander>;
    _formattedValueProvider : CachedValueProvider<MessageType>;
    _messageProviderFactory: MessageProviderIcalAdapter<*>;
    _messageProviders: {[any]: ?MessageProvider};

    constructor(id : string, dataStore : PreemptiveCache, calendarUrl : string, messageProviderFactory : MessageProviderIcalAdapter<*> ) {
        this.id = id;
        this._messageProviders = {};
        this._messageProviderFactory = messageProviderFactory;
        this._fetcher = IcalFetcher(calendarUrl);
        this._rawValueProvider = dataStore.registerFetcher(this._fetcher, id + "-fetcher", fetchIntervalSeconds);
        this._formattedValueProvider = dataStore.registerFetcher(this.formatMessage.bind(this), id + "-formatter", formatIntervalSeconds);

        this._valueFetcher = new ValueFetcherAndFormatter(id,
            dataStore,
            this._fetcher,
            60,
            this.formatMessage.bind(this),
            2,
            [Object.assign({},
                {start: 0, end: 127, text: "Loading data for " + this.id, lines: 2},
                {animation: {animationName: "VerticalScrollingAnimation", holdOnLine: 50}})]
        );
    }

    createMessageProvider(event : any) {
        const eventIdentifier = event.id + event.lastUpdate;
        if (!this._messageProviders[eventIdentifier]) {
            this._messageProviders[eventIdentifier] = this._messageProviderFactory.createMessageProvider(event.id, event);
        }
        return this._messageProviders[eventIdentifier];
    }


    //noinspection JSMethodCanBeStatic
    formatMessage(events : R) : Promise<MessageType> {
        let providers = events.map(event => this.createMessageProvider(event)).filter((messageProvider : ?MessageProvider) => messageProvider);
        // TODO: Prioritize
        if (providers.length > 0) {
            let provider : (MessageProvider | PlaylistProvider) = providers[0];
            if (typeof provider.getMessage === "function") {
                return Promise.resolve(provider.getMessage());
            } else if (typeof provider.getPlaylist === "function") {
                return Promise.resolve(provider.getPlaylist());
            } else {
                throw new Error("Unsupported provider");
            }
        } else {
            console.warn("No events with usable providers", events);
            return Promise.reject();
        }
    }

    getMessage() : ?MessageType {
        return this._valueFetcher.getValue();
    }
}

module.exports = IcalScheduleProvider;

