// @flow

// const React = require("React");
// const groupBy = require("lodash").groupBy;
// const groupBy = require("lodash").groupBy;

const zip = require("lodash").zip;
const values = require("lodash").values;

export type Slot = {
    colSpan : number,
    calendarUrl: ?string
}

export type MessageProviderName = 'Entur' | 'Yr' | 'Bysykkel';

export type Calendar = {
    url: string,
    name : string,
    messageProvider : MessageProviderName
}

class ScheduleProviderPrioritySetup {

    layout : Array<Array<Slot>>;
    calendars : {[url : string] : Calendar};

    constructor(layout : Array<Array<Slot>>, calendars : {[string] : Calendar}) {
        this.layout = layout;
        this.calendars = calendars;
    }

    mapSlotToCalendar(slot : Slot) : ?Calendar {
        return slot.calendarUrl && this.calendars[slot.calendarUrl] || undefined;
    }

    getCalendars() : Array<Calendar> {
        return values(this.calendars);
    }

    getPrioritizedLists() : Array<Array<Calendar>> {
/*
        let numCols = Math.max(
            ...this.layout
                .map((slotRow : Array<Slot>) => slotRow.map((slot : Slot) => slot.colSpan)
                    .reduce((accumulator, currentValue) => accumulator + currentValue, 0)
                )
        );
*/
        let resultRows = this.expandColSpans(this.layout);
        let cols = zip(...resultRows);
        return cols.map(col => col.map((slot: Slot) => this.mapSlotToCalendar(slot)).filter(Boolean));
    }

    // noinspection JSMethodCanBeStatic
    expandColSpans(layout : Array<Array<Slot>>) {
        let resultRows = [];
        for (let rowIdx = 0; rowIdx < layout.length; rowIdx++) {
            resultRows[rowIdx] = [];
            let row = layout[rowIdx];
            for (let slotIdx = 0; slotIdx < row.length; slotIdx++) {
                let slot = row[slotIdx];
                for (let colIdx = 0; colIdx < slot.colSpan; colIdx++) {
                    resultRows[rowIdx].push(slot);
                }
            }
        }
        return resultRows;
    }

}

module.exports = ScheduleProviderPrioritySetup;