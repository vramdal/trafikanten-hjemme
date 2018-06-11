// @flow

import type {Location} from "../types/Place";

const moment = require("moment");
const IcalExpander = require("ical-expander");
const fetch = require("node-fetch");
const geocoder = require("../geocoding/EnturGeocoder");

export type CalendarEvent = {
    startDate : Date,
    endDate : Date,
    summary: string,
    location: ?Location,
    locationString: ?string,
    id: string,
    lastModified: string
};



const IcalFetcher = (url: string, options: ?{}) => {
        return () : Promise<Array<CalendarEvent>> => fetch(url, options)
            .then(res => res.text())
            .then(ics => {
                const day = moment();
                const icalExpander = new IcalExpander({ics, maxIterations: 100});
                const events = icalExpander.between(day.startOf("day").subtract(2, "hour").toDate(), day.endOf("day").add(2, "hour").toDate());
                const mappedEvents = events.events.map(e => ({
                    startDate: e.startDate,
                    endDate: e.endDate,
                    summary: e.summary,
                    locationName: e.location,
                    description: e.description,
                    id: e.uid,
                    lastUpdate: e.component.getFirstPropertyValue("dtstamp").toString(),
                    lastModified: e.component.getFirstPropertyValue("last-modified").toString()
                }));
                const mappedOccurrences = events.occurrences.map(o => ({
                    startDate: o.startDate,
                    endDate: o.endDate,
                    description: o.item.description,
                    summary: o.item.summary,
                    locationName: o.item.location,
                    id: `${o.item.uid}-${o.recurrenceId.toString()}`,
                    lastUpdate: o.item.component.getFirstPropertyValue("dtstamp").toString(),
                    lastModified : o.item.component.getFirstPropertyValue("last-modified").toString()
                }));

                function extractLocationString(str : string) : ?string {
                    const match = /([^\s^\/]*\/[^\s^\/]*\/[^\s^\/]*\/[^\s^\/]*)/.exec(str);
                    if (match) {
                        return match[1];
                    } else {
                        return str;
                    }
                }

                const allEvents : Array<*> = [].concat(mappedEvents, mappedOccurrences);

                return Promise.all(
                    allEvents.map(event => event.locationName).map(locationStr => geocoder(locationStr))
                ).then((locations : Array<Location>) => {
                    return allEvents.map((event, idx) => Object.assign({}, event, {
                        startDate : new Date(event.startDate),
                        endDate : new Date(event.endDate),
                        summary: event.summary,
                        location: undefined,
                        locationString: extractLocationString(event.description),
                        id: event.id,
                        lastModified: event.lastModified,
                        location: locations[idx]
                    }))
                        .filter(event => event.endDate > moment().toDate());
                });
            })
    }
;

module.exports = IcalFetcher;