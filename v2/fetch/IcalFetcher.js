// @flow

import type {Location} from "../Place";

const moment = require("moment");
const IcalExpander = require("ical-expander");
const fetch = require("node-fetch");
const geocoder = require("../geocoding/EnturGeocoder");

const IcalFetcher = (url: string, options: ?{}) => {
        return () => fetch(url, options)
            .then(res => res.text())
            .then(ics => {
                const day = moment();
                const icalExpander = new IcalExpander({ics, maxIterations: 100});
                const events = icalExpander.between(day.startOf("day").toDate(), day.endOf("day").add(1, "hour").toDate());
                const mappedEvents = events.events.map(e => ({startDate: e.startDate, summary: e.summary, locationName: e.location, id: e.uid, lastUpdate: e.component.getFirstPropertyValue("dtstamp").toString()}));
                const mappedOccurrences = events.occurrences.map(o => ({
                    startDate: o.startDate,
                    summary: o.item.summary,
                    locationName: o.item.location,
                    id: o.item.uid,
                    lastUpdate: o.item.component.getFirstPropertyValue("dtstamp").toString()
                }));
                const allEvents = [].concat(mappedEvents, mappedOccurrences);
                return Promise.all(
                    allEvents.map(occurrence => occurrence.locationName).map(locationStr => geocoder(locationStr))
                ).then((locations : Array<Location>) => {
                    return allEvents.map((event, idx) => Object.assign({}, event, {location: locations[idx]}));
                });
            })
    }
;

module.exports = IcalFetcher;