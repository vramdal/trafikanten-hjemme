// @flow
// import type {CachedValueProvider} from "../fetch/Cache";
import type {MessageProvider, MessageProviderIcalAdapter} from "../provider/MessageProvider";
import type {MessageType} from "../message/MessageType";
import type {CalendarEvent} from "../fetch/IcalFetcher";
import type {Location} from "../Place";

const ValueFetcherAndFormatter = require("../fetch/ValueFetcherAndFormatter").ValueFetcherAndFormatter;
const IcalFetcher = require("../fetch/IcalFetcher");
const PreemptiveCache = require("../fetch/PreemptiveCache.js");
const IcalExpander = require("ical-expander");

const fetchIntervalSeconds = 60;
const formatIntervalSeconds = 60;

export type LocationString = string;

export type DisplayEvent = {
    start: Date,
    end: Date,
    messageProviderFactory: MessageProviderIcalAdapter<*>,
    details: (Location | LocationString)
}

export interface ScheduleProvider {
    id : string
}


class IcalScheduleProvider implements ScheduleProvider {

    id : string;
    _valueFetcher : ValueFetcherAndFormatter<Array<CalendarEvent>>;

    _fetcher : () => Promise<IcalExpander>;
    _messageProviderFactory: MessageProviderIcalAdapter<*>;
    // _messageProviders: {[any]: ?MessageProvider};

    constructor(id : string, dataStore : PreemptiveCache, calendarUrl : string, messageProviderFactory : MessageProviderIcalAdapter<*> ) {
        this.id = id;
        this._messageProviderFactory = messageProviderFactory;
        this._fetcher = IcalFetcher(calendarUrl);

        this._valueFetcher = new ValueFetcherAndFormatter(id,
            dataStore,
            this._fetcher,
            fetchIntervalSeconds,
            this.deduceDisplaySchedule.bind(this, () => new Date()),
            formatIntervalSeconds,
            [Object.assign({},
                {start: 0, end: 127, text: "Loading data for " + this.id, lines: 2},
                {animation: {animationName: "VerticalScrollingAnimation", holdOnLine: 50}})]
        );
    }

/*
    createMessageProvider(event : any) {
        const eventIdentifier = event.id + event.lastModified;
        if (!this._messageProviders[eventIdentifier]) {
            this._messageProviders[eventIdentifier] = this._messageProviderFactory.createMessageProvider(event.id, event);
        }
        return this._messageProviders[eventIdentifier];
    }
*/

    //noinspection JSMethodCanBeStatic
    // TODO Test
    deduceDisplaySchedule(nowProvider : () => Date, events : Array<CalendarEvent>) : Promise<Array<DisplayEvent>> {

        let now = nowProvider();
        return Promise.resolve(
            events
                .filter(event => event.location)
                .filter(event => event.endDate >= now)
                .map((event : CalendarEvent) =>
                    ({
                        start: event.startDate,
                        end: event.endDate,
                        messageProviderFactory: this._messageProviderFactory,
                        details: event.location
                    })))
    }
        // TODO: Prioritize
        // let providers = events.map(event => this.createMessageProvider(event)).filter((messageProvider : ?MessageProvider) => messageProvider);
/*
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
*/

    getMessage() : ?MessageType {
        return this._valueFetcher.getValue();
    }
}

module.exports = IcalScheduleProvider;

