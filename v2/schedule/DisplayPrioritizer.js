// @flow

import type {DisplayEvent, ScheduleProvider} from "./IcsScheduleProvider";
import type {Calendar, MessageProviderName} from "./ScheduleProviderPrioritySetup";
import type {MessageProviderIcalAdapter, ProviderUnion} from "../provider/MessageProvider";
import type {DisplayEventChangeset} from "./IcsScheduleProvider";
import type {PlaylistType} from "../message/MessageType";

const PreemptiveCache = require("../fetch/PreemptiveCache.js");
const ScheduleProviderPrioritySetup = require("./ScheduleProviderPrioritySetup.js");
const Yr = require("../Yr");
const Entur = require("../Entur");
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

    constructor(scheduleProviderPrioritySetup : ScheduleProviderPrioritySetup, dataStore : PreemptiveCache) {
        this._dataStore = dataStore;
        this._playlist = [[Object.assign({},
            { start: 0, end: 127, text: "aaa\nbbb", lines: 1},
            { animation: {animationName : "VerticalScrollingAnimation", holdOnLine: 50, holdOnLastLine: 100, alignment: "center"}})]];
        this._scheduleProviderPrioritySetup = scheduleProviderPrioritySetup;
        const prioritizedCalendarSetup = this._scheduleProviderPrioritySetup.getPrioritizedLists();
        this._scheduleProviders = {};
        this._scheduleProviderPrioritySetup.getCalendars().forEach((calendar : Calendar) => {
            let messageProviderFactory : MessageProviderIcalAdapter<*> = this.createMessageProviderFactory(calendar.messageProvider);
            if (!this._scheduleProviders[calendar.url]) {
                this._scheduleProviders[calendar.url] = new IcalScheduleProvider(`schedule-provider-${calendar.url}`, dataStore, calendar.url, messageProviderFactory, calendar.name);
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
    createMessageProviderFactory(messageProviderName : MessageProviderName) : MessageProviderIcalAdapter<*> {
        switch (messageProviderName) {
            case 'Entur' : return new Entur.factory(this._dataStore);
            case 'Yr' : return new Yr.factory(this._dataStore);
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

    createPlaylist(forWhen : moment) : Promise<PlaylistType> { // TODO: Needs work
        let outerPromises = [];
        for (let scheduleProviderList : Array<ScheduleProvider> of this._prioritizedScheduleProviderLists) {
            let promises = scheduleProviderList
                .map((scheduleProvider : ScheduleProvider) => scheduleProvider
                    .getEventsAt(forWhen)
                    .then(events => ({scheduleProvider, hasEvent : events.length > 0})));

            outerPromises.push(
                Promise.all(promises)
                    .then((scheduleProvidersWithStatus : Array<{scheduleProvider : ScheduleProvider, hasEvent: boolean}>) => scheduleProvidersWithStatus
                        .filter(o => o.hasEvent)
                        .map(o => o.scheduleProvider)
                        [0] // TODO <--
                    )); //
        }
        return Promise.all(outerPromises)
            .then((scheduleProviders : Array<ScheduleProvider>) => flatten(scheduleProviders
                .filter(Boolean)
                .map((scheduleProvider : ScheduleProvider) => scheduleProvider.getCurrentProviders())
                .map((providerUnions : Array<ProviderUnion>) => providerUnions
                    .map((providerUnion : ProviderUnion) => DisplayPrioritizer.getMessageArray(providerUnion)))));


    }

    static getMessageArray(provider : ProviderUnion) : PlaylistType {
        if (typeof provider.getMessage === "function") {
            return provider.getMessage();
        } else if (typeof provider.getPlaylist === "function") {
            return flatten(provider.getPlaylist());
        } else {
            throw new Error(`Not a provider: ${provider.toString()}`);
        }
    }

}

module.exports = DisplayPrioritizer;