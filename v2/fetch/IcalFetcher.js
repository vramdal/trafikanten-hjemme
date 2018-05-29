// @flow

import type {Location} from "../Place";

const moment = require("moment");
const IcalExpander = require("ical-expander");
const fetch = require("node-fetch");
const geocoder = require("../geocoding/EnturGeocoder");

export type CalendarEvent = {
    startDate : object,
    endDate : object,
    summary: string,
    location: ?string,
    locationString: ?string,
    id: string,
    lastModified: string

};



const IcalFetcher = (url: string, options: ?{}) => {
        return () => fetch(url, options)
            .then(res => res.text())
            .then(ics => {
                const day = moment();
                const icalExpander = new IcalExpander({ics, maxIterations: 100});
                const events = icalExpander.between(day.startOf("day").toDate(), day.endOf("day").add(1, "hour").toDate());
                const mappedEvents = events.events.map(e => ({
                    startDate: e.startDate,
                    endDate: e.endDate,
                    summary: e.summary,
                    locationName: e.location,
                    id: e.uid,
                    lastUpdate: e.component.getFirstPropertyValue("dtstamp").toString(),
                    lastModified: e.component.getFirstPropertyValue("last-modified").toString()
                }));
                const mappedOccurrences = events.occurrences.map(o => ({
                    startDate: o.startDate,
                    endDate: o.endDate,
                    summary: o.item.summary,
                    locationName: o.item.location,
                    id: o.item.uid,
                    lastUpdate: o.item.component.getFirstPropertyValue("dtstamp").toString(),
                    lastModified : o.item.component.getFirstPropertyValue("last-modified").toString()
                }));

                function extractLocationString(str : string) : ?str {
                    // TODO
                    return str.indexOf("/") !== -1 ? str : undefined;
                }

                const allEvents : Array<CalendarEvent> = [].concat(mappedEvents, mappedOccurrences).map(icalEvent => ({
                    startDate : new Date(icalEvent.startDate),
                    endDate : new Date(icalEvent.endDate),
                    summary: icalEvent.summary,
                    location: undefined,
                    locationString: extractLocationString(icalEvent.summary),
                    id: icalEvent.id,
                    lastModified: icalEvent.lastModified
                }));

                return Promise.all(
                    allEvents.map(occurrence => occurrence.locationName).map(locationStr => geocoder(locationStr))
                ).then((locations : Array<Location>) => {
                    return allEvents.map((event, idx) => Object.assign({}, event, {location: locations[idx]}));
                });
            })
    }
;

module.exports = IcalFetcher;