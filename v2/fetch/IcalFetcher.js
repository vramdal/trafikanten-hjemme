// @flow

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
                const mappedEvents = events.events.map(e => ({startDate: e.startDate, summary: e.summary, location: e.location}));
                const mappedOccurrences = events.occurrences.map(o => ({
                    startDate: o.startDate,
                    summary: o.item.summary,
                    location: o.item.location
                }));
                const allEvents = [].concat(mappedEvents, mappedOccurrences);
                return Promise.all(
                    allEvents.map(occurrence => occurrence.location).map(locationStr => geocoder(locationStr))
                ).then(locationsCoordinates => {
                    const eventsWithCoordinates = allEvents.map((event, idx) => Object.assign({}, event, {coordinates: locationsCoordinates[idx]}));
                    console.log("eventsWithCoordinates", eventsWithCoordinates.map(e => `${e.startDate.toJSDate().toISOString()} - ${e.summary} - ${e.location} - ${JSON.stringify(e.coordinates)}`).join('\n'));
                    return eventsWithCoordinates;
                });
            })
    }
;

module.exports = IcalFetcher;