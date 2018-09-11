// @flow
const ValueFetcherAndFormatter = require("../fetch/ValueFetcherAndFormatter.js").ValueFetcherAndFormatter;


const AVAILABILITY_URL = "https://oslobysykkel.no/api/v1/stations/availability";
const STATIONS_URL = "https://oslobysykkel.no/api/v1/stations";
const PreemptiveCache = require("../fetch/PreemptiveCache.js");
const JsonFetcher = require("../fetch/ValueFetcherAndFormatter.js").JsonFetcher;
const settings = require("../settings/index");

import type {MessageType} from "../message/MessageType";
import type {MessageProviderIcalAdapter, MessageProvider} from "./MessageProvider";
import type {Location, LatLong} from '../types/Place';

type LatLongType = {
    latitude: number,
    longitude: number
}

type StationType = {
    id: number,
    title: string,
    subtitle: string,
    number_of_locks: number,
    center: LatLongType,
    bounds: Array<LatLongType>
}

// noinspection JSUnusedLocalSymbols
type StationsResponseType = {
    stations: Array<StationType>
}

type StationAvailabilityType = {
    id: number,
    availability: {
        bikes: number,
        locks: number
    }
}

type IsoDateStringType = string;

type AvailabilityResponseType = {
    stations: Array<StationAvailabilityType>,
    updated_at: IsoDateStringType,
    refresh_rate: number
}

// noinspection JSUnusedLocalSymbols
type StatusResponseType = {
    status: {
        all_stations_closed: boolean,
        stations_closed: Array<StationType>
    }
}

/*
const defaultStationId = 358;
const defaultStationName = "Kampen park øst";

*/
function distance(lat1, lon1, lat2, lon2) {
    const p = 0.017453292519943295;    // Math.PI / 180
    const c = Math.cos;
    const a = 0.5 - c((lat2 - lat1) * p) / 2 +
        c(lat1 * p) * c(lat2 * p) *
        (1 - c((lon2 - lon1) * p)) / 2;

    return 12742 * Math.asin(Math.sqrt(a)); // 2 * R; R = 6371 km
}

function latLongDistance(latLong1 : LatLong, latLong2 : LatLong) {
    try {
        return distance(latLong1.latitude, latLong1.longitude, latLong2.latitude, latLong2.longitude);
    } catch (e) {
        console.warn(e, latLong1, latLong2);
        return Number.MAX_SAFE_INTEGER;
    }
}

class Bysykkel implements MessageProvider {

    _id: string;
    _statusFetcherPromise: Promise<ValueFetcherAndFormatter<AvailabilityResponseType>>;

    static factory : Class<MessageProviderIcalAdapter<MessageProvider>>;
    _stationId: number;
    _stationname: string;
    _apiKey : string;
    _stationsListPromise: Promise<Array<StationType>>;
    _location: Location;


    constructor(id: string, dataStore: PreemptiveCache, apiKey : string, stationsListPromise : Promise<Array<StationType>>, location : Location) {
        this._id = id;
        this._apiKey = apiKey;
        this._stationsListPromise = stationsListPromise;
        this._location = location;
        this._statusFetcherPromise = this._stationsListPromise.then((stationsList : Array<StationType>) => {
            const nearestStation : StationType = stationsList
                .sort((stationA : StationType, stationB : StationType) => latLongDistance(stationA.center, location.coordinates) - latLongDistance(stationB.center, location.coordinates))
            [0];
            this._stationId = nearestStation.id;
            this._stationname = nearestStation.title;
            return new ValueFetcherAndFormatter(
                `bysykkel-${nearestStation.id}-availability`,
                dataStore,
                JsonFetcher(AVAILABILITY_URL, {headers: {"Client-Identifier": apiKey}}),
                30,
                this.format.bind(this),
                10
            );
        });
    }

    format(availabilityResponse : AvailabilityResponseType) : Promise<MessageType> {
        let bikesBitmap = (numBikes : number) => {
            let str = `${numBikes ? numBikes : "Ingen"} `;
            for (let i = 0; i < numBikes && i < 8; i++) {
                str += String.fromCharCode(22900);
            }
            if (numBikes > 8) {
                str += " +";
            }
            if (numBikes === 0) {
                str += String.fromCharCode(22900);
            }
            return str;
        };
/*
        let locksBitmap = (numLocks : number) => {
            let str = "";
            str += `(${numLocks})`;
            for (let i = 0; i < numLocks && i < 4; i++) {
                str += String.fromCharCode(22901);
            }
            return str;
        };
*/

        let messages = availabilityResponse.stations
            && availabilityResponse.stations
                .filter(station => station.id === this._stationId)
                .map((station : StationAvailabilityType) => [
                    {
                        text: this._stationname,
                        start: 0, end: 128, lines: 1,
                        animation: {animationName : "NoAnimation", timeoutTicks: 100, alignment: "center"}
                    },
                    {
                        text: bikesBitmap(station.availability.bikes),
                        start: 128, end: 255, lines: 1,
                        animation: {animationName : "NoAnimation", timeoutTicks: 100, alignment: "center"}
                    }
                ]);
        if (messages && messages.length > 0) {
            return Promise.resolve(messages[0]);
        } else {
            console.error("Response", availabilityResponse);
            return Promise.reject("No information for station " + this._stationId);
        }
    }

    getMessage() : ?MessageType {
        return this._statusFetcherPromise.then((statusFetcher : ValueFetcherAndFormatter<AvailabilityResponseType>) => statusFetcher.getValue());
    }

    getMessageAsync(fresh : boolean) : Promise<MessageType> {
        return this._statusFetcherPromise.then((statusFetcher: ValueFetcherAndFormatter<AvailabilityResponseType>) => statusFetcher.getMessageAsync(fresh));
    }

    shutdown() {

    }
}

class BysykkelProviderFactory implements MessageProviderIcalAdapter<MessageProvider> {
    _dataStore: PreemptiveCache;
    _apiKey : string;
    _displayEventTitle: boolean;
    _stationsListFetcher : ValueFetcherAndFormatter<StationsResponseType>;

    constructor(dataStore : PreemptiveCache, config: {}, displayEventTitle: boolean) {
        this._dataStore = dataStore;
        this._displayEventTitle = displayEventTitle;
        this._apiKey = settings.get("oslobysykkel").apiKey;
        this._stationsListFetcher = new ValueFetcherAndFormatter(
            'bysykkel-stations-list-fetcher',
            this._dataStore,
            JsonFetcher(STATIONS_URL, {headers: {"Client-Identifier": this._apiKey}}),
            60*60*24,
            (response: StationsResponseType) : Promise<Array<StationType>> => Promise.resolve(response.stations),
            60*60*24
            )
    }

    //noinspection JSUnusedGlobalSymbols
    createMessageProvider(id : string, options : {location: Location}) : Bysykkel {
        return new Bysykkel(id, this._dataStore, this._apiKey, this._stationsListFetcher.getMessageAsync(), options.location);
    }
}

module.exports = Bysykkel;
module.exports.factory = BysykkelProviderFactory;