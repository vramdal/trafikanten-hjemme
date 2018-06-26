// @flow
const ValueFetcherAndFormatter = require("../fetch/ValueFetcherAndFormatter.js").ValueFetcherAndFormatter;


const AVAILABILITY_URL = "https://oslobysykkel.no/api/v1/stations/availability";
//const STATIONS_URL = "https://oslobysykkel.no/api/v1/stations";
const PreemptiveCache = require("../fetch/PreemptiveCache.js");
const JsonFetcher = require("../fetch/ValueFetcherAndFormatter.js").JsonFetcher;
const settings = require("../settings/index");

import type {MessageType} from "../message/MessageType";
import type {MessageProviderIcalAdapter, MessageProvider} from "./MessageProvider";

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

const defaultStationId = 358;
const defaultStationName = "Kampen park øst";

class Bysykkel implements MessageProvider {

    _id: string;
    _statusFetcher: ValueFetcherAndFormatter<AvailabilityResponseType>;

    static factory : Class<MessageProviderIcalAdapter<MessageProvider>>;
    _stationId: number;
    _stationname: string;
    _apiKey : string;


    constructor(id: string, dataStore: PreemptiveCache, apiKey : string, stationId : number = defaultStationId, stationname: string = defaultStationName) {
        this._id = id;
        this._stationId = stationId;
        this._stationname = stationname;
        this._apiKey = apiKey;
        this._statusFetcher = new ValueFetcherAndFormatter(
            `bysykkel-${this._stationId}-availability`,
            dataStore,
            JsonFetcher(AVAILABILITY_URL, {headers: {"Client-Identifier": apiKey}}),
            30,
            this.format.bind(this),
            10
        );
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
        return this._statusFetcher.getValue();
    }

    getMessageAsync(fresh : boolean) : Promise<MessageType> {
        return this._statusFetcher.getMessageAsync(fresh);
    }

    shutdown() {

    }
}

class BysykkelProviderFactory implements MessageProviderIcalAdapter<MessageProvider> {
    _dataStore: PreemptiveCache;
    _apiKey : string;
    _displayEventTitle: boolean;

    constructor(dataStore : PreemptiveCache, config: {}, displayEventTitle: boolean) {
        this._dataStore = dataStore;
        this._displayEventTitle = displayEventTitle;
        this._apiKey = settings.get("bysykkel").apiKey;
    }

    //noinspection JSUnusedGlobalSymbols
    createMessageProvider(id : string, options : {idAndDescriptionString: string}) : Bysykkel {
        let stationId : number = parseInt(options.idAndDescriptionString, 10);
        let stationNameMatch : ?Array<any> = options.idAndDescriptionString.match(/[\d\s]+(.*)/);
        let stationName = "Bysykkel";
        if (stationNameMatch) {
            stationName = stationNameMatch[1];
        }
        return new Bysykkel(id, this._dataStore, this._apiKey, stationId, stationName);
    }
}

module.exports = Bysykkel;
module.exports.factory = BysykkelProviderFactory;