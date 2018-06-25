// @flow
import type {AdapterUnion, ProviderUnion} from "../provider/MessageProvider";
import type {CalendarEvent} from "../fetch/IcalFetcher";
import type {Location} from "../types/Place";
import type {CachedValueProvider} from "../fetch/Cache";
import type {PlaylistType} from "../message/MessageType";

const IcalFetcher = require("../fetch/IcalFetcher");
const PreemptiveCache = require("../fetch/PreemptiveCache.js");
const IcalExpander = require("ical-expander");
const moment = require("moment");
const keys = require("lodash").keys;
const values = require("lodash").values;
const keyBy = require("lodash").keyBy;
const autoBind = require("auto-bind");
const fetchIntervalSeconds = 20;

export type LocationString = string;
export type IdAndDescriptionString = string;

export type DisplayEvent = {
    start: moment,
    end: moment,
    messageProviderFactory: AdapterUnion,
    details: (Location | LocationString | IdAndDescriptionString),
    internal: {
        calendarEventId : string,
        lastModified: moment
    }
}

export interface ScheduleProvider {
    id : string,
    name : ?string,
    getEventsAt(when: moment) : Promise<Array<CalendarEvent>>,
    hasEventAt(when: moment) : Promise<boolean>,
    prepareNext(when : moment) : Promise<DisplayEventChangeset>,
    executeNext(changeset : DisplayEventChangeset) : void,
    getCurrentProviders() : Array<ProviderUnion>,
    getProviders() : Array<ProviderUnion>,
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
    _messageProviderFactory: AdapterUnion;
    _messageProviders : {[calendarEventId : string] : ProviderUnion};
    _calendarEventsById: {[calendarEventId : string] : CalendarEvent};
    _displayEventChangeset : DisplayEventChangeset;
    name : ?string;

    constructor(id : string, dataStore : PreemptiveCache, calendarUrl : string, messageProviderFactory : AdapterUnion, name : string ) {
        autoBind(this);
        this.id = id;
        this.name = name;
        this._messageProviderFactory = messageProviderFactory;
        this._fetcher = IcalFetcher(calendarUrl);
        this._valueProvider = dataStore.registerFetcher(this._fetcher, this.id+"-fetcher", fetchIntervalSeconds);
        this._messageProviders = {};
        this._displayEventChangeset = {};
    }

    getEventsAt(when: moment) : Promise<Array<CalendarEvent>> {
        return this._valueProvider()
            .then((calendarEvents : Array<CalendarEvent>) =>
                calendarEvents.filter((calendarEvent : CalendarEvent) => {
                    const start = moment(calendarEvent.startDate.getTime());
                    const end = moment(calendarEvent.endDate.getTime());
                    return start.isBefore(when) && end.isAfter(when);
                })
            )
    }

    hasEventAt(when: moment) : Promise<boolean> {
        return this.getEventsAt(when)
            .then(events => events.length > 0);
    }

    prepareNext(forWhen: moment): Promise<DisplayEventChangeset> {
        return this._valueProvider()
            .then((calendarEvents : Array<CalendarEvent>) => {
                let added = calendarEvents
                    .filter(calendarEvent => !this._messageProviders[calendarEvent.id])
                    .filter(calendarEvent => calendarEvent.location || calendarEvent.locationString)
                    .map(this.mapToDisplayEvent)
                    .filter((displayEvent: DisplayEvent) => {
                        return displayEvent.start.isBefore(forWhen) && displayEvent.end.isAfter(forWhen);
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

    static getPlaylistAsync(provider : ProviderUnion, fresh : boolean) : Promise<PlaylistType> {
        if (typeof provider.getMessageAsync === "function") {
            return provider.getMessageAsync(fresh).then(message => [message]);
        } else if (typeof provider.getPlaylistAsync === "function") {
            return provider.getPlaylistAsync(fresh);
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
            });
        }
    }

    getCurrentProviders() : Array<ProviderUnion> {
        return values(this._messageProviders)
            .filter((messageProvider : ProviderUnion) => typeof messageProvider.isReady === "function" ? messageProvider.isReady() : true)
    }

    getProviders() : Array<ProviderUnion> {
        return values(this._messageProviders);
    }

    mapToDisplayEvent(event: CalendarEvent) : DisplayEvent {
        return {
            start: moment(event.startDate),
            end: moment(event.endDate),
            messageProviderFactory: this._messageProviderFactory,
            details: {location: event.location, locationString: event.locationString, idAndDescriptionString: event.locationString},
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

