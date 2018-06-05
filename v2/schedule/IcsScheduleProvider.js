// @flow
// import type {CachedValueProvider} from "../fetch/Cache";
import type {MessageProviderIcalAdapter, ProviderUnion} from "../provider/MessageProvider";
import type {CalendarEvent} from "../fetch/IcalFetcher";
import type {Location} from "../Place";
import type {CachedValueProvider} from "../fetch/Cache";

const IcalFetcher = require("../fetch/IcalFetcher");
const PreemptiveCache = require("../fetch/PreemptiveCache.js");
const IcalExpander = require("ical-expander");
const moment = require("moment");
const keys = require("lodash").keys;
const values = require("lodash").values;
const keyBy = require("lodash").keyBy;
const autoBind = require("auto-bind");
const fetchIntervalSeconds = 60;

export type LocationString = string;

export type DisplayEvent = {
    start: moment,
    end: moment,
    messageProviderFactory: MessageProviderIcalAdapter<*>,
    details: (Location | LocationString),
    internal: {
        calendarEventId : string,
        lastModified: moment
    }
}

export interface ScheduleProvider {
    id : string
}

export type DisplayEventChangeset = {
    updated?: Array<{ calendarEventId: string, displayEvent: DisplayEvent, messageProvider : ProviderUnion }>,
    removed?: Array<string>,
    added?: Array<{ calendarEventId: string, displayEvent: DisplayEvent, messageProvider : ProviderUnion }>,
}

class IcalScheduleProvider implements ScheduleProvider {

    id : string;
    _valueProvider : CachedValueProvider<Array<CalendarEvent>>;

    _fetcher : () => Promise<IcalExpander>;
    _messageProviderFactory: MessageProviderIcalAdapter<*>;
    _messageProviders : {[calendarEventId : string] : ProviderUnion};
    _calendarEventsById: {[calendarEventId : string] : CalendarEvent};
    _displayEventChangeset : DisplayEventChangeset;

    constructor(id : string, dataStore : PreemptiveCache, calendarUrl : string, messageProviderFactory : MessageProviderIcalAdapter<*> ) {
        autoBind(this);
        this.id = id;
        this._messageProviderFactory = messageProviderFactory;
        this._fetcher = IcalFetcher(calendarUrl);
        this._valueProvider = dataStore.registerFetcher(this._fetcher, this.id+"-fetcher", fetchIntervalSeconds);
        this._messageProviders = {};
        this._displayEventChangeset = {};
    }

    prepareNext(deadline: moment): Promise<DisplayEventChangeset> {
        return this._valueProvider()
            .then((calendarEvents : Array<CalendarEvent>) => {
                let added = calendarEvents
                    .filter(calendarEvent => !this._messageProviders[calendarEvent.id])
                    .filter(calendarEvent => calendarEvent.location)
                    .map(this.mapToDisplayEvent)
                    .filter((displayEvent: DisplayEvent) => {
                        return displayEvent.start.isBefore(deadline) && displayEvent.end.isAfter(deadline);
                    })
                    .map(this.displayEventToChangeItem)
                    .filter(displayEventChange => displayEventChange.messageProvider)
                    .filter(Boolean);
                let updated = calendarEvents
                    .filter(calendarEvent => this._messageProviders[calendarEvent.id])
                    .filter(calendarEvent => !this._calendarEventsById[calendarEvent.id] || this._calendarEventsById[calendarEvent.id].lastModified < calendarEvent.lastModified)
                    .map(this.mapToDisplayEvent)
                    .map(this.displayEventToChangeItem)
                    .filter(changeItem => changeItem.messageProvider);

                let calendarEventIds = calendarEvents.map(calendarEvent => calendarEvent.id);
                let removed = keys(this._messageProviders).filter(calendarEventId => calendarEventIds.indexOf(calendarEventId) === -1);
                this._calendarEventsById = keyBy(calendarEvents, calendarEvent => calendarEvent.id);
                let newMessageProviders = [...added, ...updated]
                    .map(changeItem => changeItem.messageProvider)
                    .map(messageProvider => IcalScheduleProvider.getMessageAsyncOrPlaylistAsync(messageProvider))
                    .map(promise => promise.then(result => result).catch(err => new Error(err)));
                return Promise.all(newMessageProviders)
                    .then(() => ({added, updated, removed}))
                    .catch(err => {
                        throw new Error(err.toString())
                    });
            });
    }

    static getMessageAsyncOrPlaylistAsync(provider : ProviderUnion) {
        if (typeof provider.getMessageAsync === "function") {
            return provider.getMessageAsync(true);
        } else if (typeof provider.getPlaylistAsync === "function") {
            return provider.getPlaylistAsync(true);
        } else {
            throw new Error(`Not a provider: ${provider.toString()}`);
        }
    }

    displayEventToChangeItem(displayEvent : DisplayEvent) : { calendarEventId: string, displayEvent: DisplayEvent, messageProvider : ProviderUnion } {
        return {
            calendarEventId: displayEvent.internal.calendarEventId,
            displayEvent: displayEvent,
            messageProvider: displayEvent.messageProviderFactory.createMessageProvider(
                `${typeof displayEvent.messageProviderFactory.displayName === "string" ? displayEvent.messageProviderFactory.displayName : displayEvent.messageProviderFactory.constructor.name}-${displayEvent.internal.calendarEventId}-${this.id}`,
                displayEvent.details
            )
        };
    }

    executeNext(changeset : DisplayEventChangeset) {

        if (changeset.added) {
            changeset.added.forEach((added : {displayEvent : DisplayEvent, messageProvider : ProviderUnion}) => this._messageProviders[`${added.displayEvent.internal.calendarEventId}`] = added.messageProvider)
        }
        if (changeset.removed) {
            changeset.removed.forEach((removed: string) => {
                let obsolete = this._messageProviders[removed];
                delete this._messageProviders[removed];
                obsolete.shutdown();
            });
        }
        if (changeset.updated) {
            changeset.updated.forEach((updated : {displayEvent : DisplayEvent, messageProvider : ProviderUnion}) => {
                let obsolete = this._messageProviders[updated.displayEvent.internal.calendarEventId];
                this._messageProviders[updated.displayEvent.internal.calendarEventId] = updated.messageProvider;
                obsolete.shutdown();
            });
        }
    }

    getCurrentProviders() : Array<ProviderUnion> {
        return values(this._messageProviders)
            .filter((messageProvider : ProviderUnion) => typeof messageProvider.isReady === "function" ? messageProvider.isReady() : true)
    }

    // TODO Test

    mapToDisplayEvent(event: CalendarEvent) : DisplayEvent {
        return {
            start: moment(event.startDate),
            end: moment(event.endDate),
            messageProviderFactory: this._messageProviderFactory,
            details: {location: event.location},
            internal: {
                calendarEventId: event.id,
                lastModified: moment(event.lastModified)
            }
        }
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
}

module.exports = IcalScheduleProvider;

