// @flow
const fetch = require("node-fetch");
import type {Geocoder} from "./index";

const CachedFetcher = require("../fetch/Cache.js").CachedFetcher;

let headers = {
    'ET-Client-Name': 'trafikanten-hjemme'
};

class EnturGeocoder implements Geocoder {

    fetcher: CachedFetcher<string, Coordinates>;

    constructor() {
        let fetcher = new CachedFetcher({}, (placeStr) => {
            const url = `https://api.entur.org/api/geocoder/1.1/search?text=${encodeURIComponent(placeStr)}&categories=NO_FILTER&focus.point.lat=59.91&focus.point.lon=10.76&lang=en`;
            return fetch(url, headers)
                .then(res => res.json())
                .then(json => {
                    if (json.features.length === 0
                        && json.geocoding
                        && json.geocoding.query
                        && json.geocoding.query.parsed_text
                        && json.geocoding.query.parsed_text.admin_parts) {
                        console.info(`No match for "${placeStr}", trying "${json.geocoding.query.parsed_text.admin_parts}"`);
                        return fetcher.getValue(json.geocoding.query.parsed_text.admin_parts);
                    } else if (json.features.length === 0) {
                        console.info(`No match for "${placeStr}", cannot geocode"`);
                        return null;
                    } else {
                        let coordinates = json.features.slice(0, 1)
                            .map(feature => feature.geometry)
                            .map(geometry => ({lat: geometry.coordinates[0], long: geometry.coordinates[1]}));
                        return coordinates[0] || null;
                    }
                });
        });
        this.fetcher = fetcher
    }

    getCoordinates(str : string) {
        return this.fetcher.getValue(str);
    }
}

const instance = new EnturGeocoder();

module.exports = instance.getCoordinates.bind(instance);

