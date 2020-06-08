// @flow
const fetch = require("node-fetch");
const settings = require("../settings");
import type {Geocoder, Coordinates} from "./index";
import type {Location} from "../types/Place";

const CachedFetcher = require("../fetch/Cache.js").CachedFetcher;

let headers = {
    'ET-Client-Name': 'trafikanten-hjemme'
};

const coordinatesRegex = /^(\d+\.\d+)\s*,\s*(\d+\.\d+)(?:,\d+)?$/;

class EnturGeocoder implements Geocoder {

    fetcher: CachedFetcher<string, Coordinates>;

    constructor() {
        const home = settings.get("home");
        let fetcher = new CachedFetcher({}, (placeStr) => {
            const url = `https://api.entur.io/geocoder/v1/autocomplete?text=${encodeURIComponent(placeStr)}&categories=NO_FILTER&focus.point.lat=${home.coordinates.latitude}&focus.point.lon=${home.coordinates.longitude}&lang=en`;
            return fetch(url, headers)
                .then(res => res.json())
                .then(json => {
                    if (!json.geocoding) {
                        console.error("Unexpected response format", json);
                        throw new Error("Unexpected response format.");
                    }
                    if (json.geocoding.errors) {
                        console.error("Entur Geocoder Error", json);
                        throw new Error(json.geocoding.errors[0]);
                    }
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
                        let locations = json.features.slice(0, 1)
                            .map(feature => feature.geometry)
                            .map((geometry : Location) => ({coordinates: {longitude: geometry.coordinates[0], latitude: geometry.coordinates[1]}, name: placeStr}));
                        return locations[0] || null;
                    }
                });
        });
        this.fetcher = fetcher
    }

    getCoordinates(str : string) : ?Promise<Coordinates> {
        if (str) {
            const match = coordinatesRegex.exec(str);
            if (str.match(coordinatesRegex)) {
                const lat : number = parseFloat(match[1]);
                const long : number = parseFloat(match[2]);
                const coordinates : Coordinates = {latitude: lat, longitude: long};
                return Promise.resolve({coordinates: coordinates });
            }
            return this.fetcher.getValue(str);
        } else {
            return undefined;
        }
    }
}

const instance = new EnturGeocoder();

module.exports = instance.getCoordinates.bind(instance);

