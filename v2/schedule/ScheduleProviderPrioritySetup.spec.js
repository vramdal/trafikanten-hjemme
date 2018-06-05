// @flow
import type {Slot} from "./ScheduleProviderPrioritySetup";

const expect = require("chai").expect;

const ScheduleProviderPrioritySetup = require("./ScheduleProviderPrioritySetup.js");

describe('ScheduleProviderPrioritySetup', () => {
    const calendars : {[url : string] : {url: string, name: string}} = {
        "calendar-1-1": {url: "calendar-1-1", name: "calendar-1-1"},
        "calendar-1-2": {url: "calendar-1-2", name: "calendar-1-2"},
        "calendar-1-3": {url: "calendar-1-3", name: "calendar-1-3"},
        "calendar-2-1": {url: "calendar-2-1", name: "calendar-2-1"},
        "calendar-2-2": {url: "calendar-2-2", name: "calendar-2-2"},
        "calendar-3-1": {url: "calendar-3-2", name: "calendar-3-2"},
    };
    it('should create a list of prioritized calendars for each column', function () {
        let layout : Array<Array<Slot>> = [
            [{calendarUrl: "calendar-1-1", colSpan: 1}, {calendarUrl: "calendar-1-2", colSpan: 1}, {calendarUrl: "calendar-1-3", colSpan: 1}],
        ];
        const setup = new ScheduleProviderPrioritySetup(layout, calendars);
        const prioritizedLists : Array<Array<{url: string, name : string}>> = setup.getPrioritizedLists();
        console.log("prioritizedLists = ", prioritizedLists);
        expect(prioritizedLists).to.have.lengthOf(3);
        expect(prioritizedLists[0]).to.have.lengthOf(1);
        expect(prioritizedLists[0][0].name).to.equal("calendar-1-1");
    });
    it('should honour colspan', function () {
        let layout : Array<Array<Slot>> = [
            [{calendarUrl: "calendar-1-1", colSpan: 2}, {calendarUrl: "calendar-1-2", colSpan: 1}],
        ];
        const setup = new ScheduleProviderPrioritySetup(layout, calendars);
        const prioritizedLists : Array<Array<{url: string, name : string}>> = setup.getPrioritizedLists();

        expect(prioritizedLists).to.have.lengthOf(3);
        expect(prioritizedLists[0]).to.have.lengthOf(1);
        expect(prioritizedLists[0][0].name).to.equal("calendar-1-1");
        expect(prioritizedLists[1][0].name).to.equal("calendar-1-1");
        expect(prioritizedLists[2][0].name).to.equal("calendar-1-2");
    });
    it('should work all together now', function () {
        let layout : Array<Array<Slot>> = [
            [{calendarUrl: "calendar-1-1", colSpan: 1}, {calendarUrl: "calendar-1-2", colSpan: 1}, {calendarUrl: "calendar-1-3", colSpan: 1}],
            [{calendarUrl: "calendar-2-1", colSpan: 2}, {calendarUrl: "calendar-2-2", colSpan: 1}],
        ];
        const setup = new ScheduleProviderPrioritySetup(layout, calendars);
        const prioritizedLists : Array<Array<{url: string, name : string}>> = setup.getPrioritizedLists();
        console.log("prioritizedLists = ", prioritizedLists);
        expect(prioritizedLists).to.have.lengthOf(3);
        expect(prioritizedLists[0]).to.have.lengthOf(2);
        expect(prioritizedLists[0][0].name).to.equal("calendar-1-1");
        expect(prioritizedLists[1][0].name).to.equal("calendar-1-2");
        expect(prioritizedLists[0][1].name).to.equal("calendar-2-1");
        expect(prioritizedLists[1][1].name).to.equal("calendar-2-1");
        expect(prioritizedLists[2][1].name).to.equal("calendar-2-2");

    });
});