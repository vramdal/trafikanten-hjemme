const expect = require("chai").expect;
const ScheduleProviderPrioritySetup = require("./ScheduleProviderPrioritySetup.js");

const createDummyMessageProvider = (text) => ({
    getMessage: () => {
        return [{text: text, start: 0, end: 0, lines: 1}]
    },
    getMessageAsync: () => {
        return Promise.resolve(() => this.getMessage());
    },
    shutdown() {

    }
});


describe('DisplayPrioritizer', () => {
    describe('createPlaylist', () => {
        let scheduleProviderPrioritySetup = new ScheduleProviderPrioritySetup(
            [[{colSpan: 1, calendarUrl: "calendar-1"}, {colspan: 1, calendarUrl: "calendar-2"}]],
            {
                "calendar-1": {
                    url: "calendar-1",
                    name: "calendar-1",
                    messageProvider: createDummyMessageProvider("calendar-1-text")
                },
                "calendar-2": {
                    url: "calendar-2",
                    name: "calendar-2",
                    messageProvider: createDummyMessageProvider("calendar-2-text")
                }
            }
        )
    });
});