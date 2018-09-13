// @flow

import type {DisplayEventChangeset, ScheduleProvider} from "./IcsScheduleProvider";
import type {Calendar, MessageProviderName} from "./ScheduleProviderPrioritySetup";
import type {AdapterUnion, ProviderUnion} from "../provider/MessageProvider";
import type {PlaylistType} from "../message/MessageType";
import type {Duration} from "moment/moment";
import type {DatePeriod} from "../types/Place";

const PreemptiveCache = require("../fetch/PreemptiveCache.js");
const Met = require("../provider/Met");
const Bysykkel = require("../provider/Bysykkel");
const ScheduleProviderPrioritySetup = require("./ScheduleProviderPrioritySetup.js");
const Yr = require("../provider/Yr");
const Entur = require("../provider/Entur");
const Textmessage = require("../provider/Textmessage");
const IcalScheduleProvider = require("./IcsScheduleProvider");
const moment = require("moment");
const mapValues = require("lodash").mapValues;
const keys = require("lodash").keys;
const flatten = require("lodash").flatten;
const ontime = require("ontime");

class DisplayPrioritizer {

    _scheduleProviders: {[calendarId : string]: ScheduleProvider};
    _scheduleProviderPrioritySetup: ScheduleProviderPrioritySetup;
    _prioritizedScheduleProviderLists : Array<Array<ScheduleProvider>>;
    _dataStore: PreemptiveCache;
    _playlist : PlaylistType;

    static DisplayDurationStrategies : { [key: string]: (any) => DisplayDurationStrategyType };

    constructor(scheduleProviderPrioritySetup : ScheduleProviderPrioritySetup, dataStore : PreemptiveCache) {
        this._dataStore = dataStore;
        this._playlist = [[Object.assign({},
            { start: 0, end: 127, text: `Loading data for ${scheduleProviderPrioritySetup.getCalendars().length} calendars`, lines: 1},
            { animation: {animationName : "VerticalScrollingAnimation", holdOnLine: 50, holdOnLastLine: 100, alignment: "center"}})]];
        this._playlist = [];
        this._scheduleProviderPrioritySetup = scheduleProviderPrioritySetup;
        const prioritizedCalendarSetup = this._scheduleProviderPrioritySetup.getPrioritizedLists();
        this._scheduleProviders = {};
        this._scheduleProviderPrioritySetup.getCalendars().forEach((calendar : Calendar) => {
            let messageProviderFactory : AdapterUnion = this.createMessageProviderFactory(calendar.messageProvider, calendar.displayEventTitle || false);
            let displayDurationStrategy : DisplayDurationStrategyType = this.createDisplayDurationStrategy(calendar);
            if (!this._scheduleProviders[calendar.url]) {
                this._scheduleProviders[calendar.url] = new IcalScheduleProvider(`schedule-provider-${calendar.url}`, dataStore, calendar.url, messageProviderFactory, calendar.name, false, displayDurationStrategy);
            }
        });
        this._prioritizedScheduleProviderLists = prioritizedCalendarSetup.map((col : Array<Calendar>) => col.map((calendar : Calendar) => this._scheduleProviders[calendar.url]));
    }

    start() {
        this.prepareChanges(moment().add(3, "second"));
        return ontime({
            cycle: [ '00', '10', '20', '30', '40', '50' ],
            single: true
        }, (ot) => {
            this.prepareChanges(moment().add(5, "second"));
            ot.done();
        })
    }
    // noinspection JSMethodCanBeStatic
    createMessageProviderFactory(messageProviderName : MessageProviderName, displayEventTitle: boolean) : AdapterUnion {
        switch (messageProviderName) {
            case 'Entur' : return new Entur.factory(this._dataStore, undefined, displayEventTitle);
            case 'Yr' : return new Yr.factory(this._dataStore, undefined, displayEventTitle);
            case 'Met': return new Met.factory(this._dataStore, undefined, displayEventTitle);
            case 'Bysykkel' : return new Bysykkel.factory(this._dataStore, undefined, displayEventTitle);
            case 'Textmessage' : return new Textmessage.factory(this._dataStore, undefined, displayEventTitle);
            default : throw new Error("Invalid message provider name: " + messageProviderName);
        }
    }

    prepareChanges(forWhen : moment) {
        // TODO: Optimize. Need only prepare those who will be visible
        const changesetPromises : {[calendarId : string] : Promise<DisplayEventChangeset> } = mapValues(this._scheduleProviders, (scheduleProvider : ScheduleProvider) => scheduleProvider.prepareNext(forWhen));

        ontime({
            cycle: [ forWhen.format("YYYY-MM-DD HH:mm:ss")],
            single: true
        },  (ot) => {
            let calendarIds : Array<string> = keys(changesetPromises);
            for (let calendarId : string of calendarIds) {
                let changesetPromise = changesetPromises[calendarId];
                let scheduleProvider : ScheduleProvider = this._scheduleProviders[calendarId];
                Promise.resolve(changesetPromise)
                    .then((changeset : DisplayEventChangeset) => {
                        scheduleProvider.executeNext(changeset);

                    });
            }
            this.createPlaylist(forWhen).then((playlist : PlaylistType) => this._playlist = playlist);
            ot.done();
        })
    }

    getPlaylist() : PlaylistType {
        return this._playlist;
    }

    createPlaylist(when : moment) : Promise<Array<PlaylistType>> {
        let columns : Array<Column> = this._prioritizedScheduleProviderLists.map(list => new Column(list));
        return Promise.all(columns.map(column => column.getPlaylistAsync(when)))
            .then((arrayOfAsyncPlaylists : Array<PlaylistType>) => flatten(arrayOfAsyncPlaylists).filter((playlist : PlaylistType) => playlist !== null))
            .catch(err => {
                console.error(err);
                return [];
            });
    }

    createDisplayDurationStrategy(calendar : Calendar) : DisplayDurationStrategyType {
        return DisplayDurationStrategies[calendar.displayDurationStrategy || "forEventDuration"]();
    }
}


class Column {
    _prioritizedScheduleProviders: Array<ScheduleProvider>;


    constructor(prioritizedScheduleProviders : Array<ScheduleProvider>) {
        this._prioritizedScheduleProviders = prioritizedScheduleProviders;
    }

    static insertHeaderMessage(provider : ProviderUnion, playlist : PlaylistType) : PlaylistType {
        if (provider.title) {
            const headerMessagePart = {
                text: provider.title,
                start: 0, end: 128, lines: 2,
                animation: {animationName : "PagingAnimation", timeoutTicks: 50, alignment: "center"}
            };
            playlist.unshift([headerMessagePart]);
            return playlist;
        } else {
            return playlist;
        }
    }

    getPlaylist(providerUnions : ?Array<ProviderUnion>) {
        return providerUnions && providerUnions
            && Promise.all(providerUnions
                .map((providerUnion => IcalScheduleProvider.getPlaylistAsync(providerUnion, true)
                    .then(playlist => Column.insertHeaderMessage(providerUnion, playlist))))
            ).then((playlists: Array<PlaylistType>) => flatten(playlists))
    }

    getPlaylistAsync(moment : moment) : Promise<PlaylistType> {
        const promises = this._prioritizedScheduleProviders
            .map((scheduleProvider: ScheduleProvider) => scheduleProvider.hasEventAt(moment));
        return Promise.all(promises)
            .then((values: Array<boolean>) => values
                .map((b: boolean, idx: number) => b ? this._prioritizedScheduleProviders[idx] : null)
                .filter(Boolean)
                [0] || null)
            .then((scheduleProvider: ?ScheduleProvider) => scheduleProvider && scheduleProvider.getProviders() || null)
            .then(this.getPlaylist)
    }

}

module.exports = DisplayPrioritizer;

export type DisplayDurationStrategyType = (calendarEvent: DatePeriod, when: moment) => boolean;

// noinspection JSUnusedGlobalSymbols - reflection
const DisplayDurationStrategies: { [key: string]: (any) => DisplayDurationStrategyType } = {
    forEventDuration: () => IcalScheduleProvider.forEventDuration,
    upToEventStart: (duration: Duration = moment.duration(1, "h")) => IcalScheduleProvider.upToEventStart(duration)
};

module.exports.DisplayDurationStrategies = DisplayDurationStrategies;

export type DisplayDurationStrategyName = $Keys<typeof DisplayDurationStrategies>;