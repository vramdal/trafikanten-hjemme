// @flow

import type {DisplayEvent, ScheduleProvider} from "./IcsScheduleProvider";
import {MessageProvider} from "../provider/MessageProvider";
class DisplaySchedule {

    eventsPrProvider: {[scheduleProviderId : string]: Array<DisplayEvent>};
    eventsById: {[id : string] : DisplayEvent};
    providerPriority: Array<string>;

    constructor() {
        this.eventsPrProvider = {};
        this.providerPriority = [];
    }

    addOrUpdateEvents(scheduleProvider : ScheduleProvider, events: Array<DisplayEvent>) {
        this.eventsPrProvider[scheduleProvider.id] =  this.eventsPrProvider[scheduleProvider.id] || [];
        this.eventsPrProvider[scheduleProvider.id].push(...events);
    }

    updateEventsByScheduleProvider(scheduleProvider : ScheduleProvider, events: Array<DisplayEvent>) {

    }

    remvoeEventsByScheduleProvider(scheduleProvider : ScheduleProvider, events: Array<DisplayEvent>) {

    }

    getCurrentEvents(date : Date) {

    }

    getNextEvent(from : Date, to: Date) {

    }


}