// @flow

import type {PlaylistProvider} from "./PlaylistProvider";
import type {MessageProviderIcalAdapter} from "./MessageProvider";

const NoAnimation = require("../animations/NoAnimation.js");
const PreemptiveCache = require("../fetch/PreemptiveCache.js");
const ValueFetcherAndFormatter = require("../fetch/ValueFetcherAndFormatter.js").ValueFetcherAndFormatter;
const XmlFetcher = require("../fetch/ValueFetcherAndFormatter.js").XmlFetcher;
import type {MessageType, PlaylistType} from "../message/MessageType";
import type {Alignments} from "../animations/Types";
import type {LatLong, Location} from "../types/Place";
const moment = require("moment");
require("moment-round");

//const defaultPlace = "Norge/Oslo/Oslo/Kampen";

type PrecipitationType = {
    value: number,
    unit: string,
    minvalue: number,
    maxvalue: number,

}

type PrecipitationTimeType = {
    from: dateStringType,
    to: dateStringType,
    location: LocationType & {precipitation: PrecipitationType},
}

type dateStringType = string;

type MetPrecipitationForecastType = PrecipitationTimeType


export type MetPrecipitationResponse = MetResponseType<MetPrecipitationForecastType>;

type MetResponseError = {
    error: {
        info : {
            message : string
        }
    },
    status: "ERROR"
}


type MetResponseType<T> = {
    weatherdata: {
        meta: any,
        product: {
            class: "pointData",
            time: Array<T>
        }},
    status: "SUCCESS"
} | MetResponseError

type LocationType = {
    altitude: number,
    latitude: number,
    longitude: number,
    symbol?: {
        number: number,
        id: string,
    },
    temperature?: {
        unit: string,
        value: number
    },
    windDirection?: {
        deg: number,
        name: string
    },
    windSpeed?: {
        mps: number,
        name: string,
        beaufort: number
    },
    pressure?: {
        unit: string,
        value: number
    }
}

type TimeType = {
    datatype: "forecast",
    from: string,
    to: string,
    location: LocationType & {precipitation? : PrecipitationType}
}

type PeriodType = 'NIGHT' | 'MORNING' | 'DAY' | 'EVENING' | 'NOW'


type ParsedTimeType = {
    from: moment,
    to: moment,
    location: LocationType
}

type CoercedTimeType = {
    time: moment,
    period : PeriodType,
    symbol?: {
        number: number,
        id: string
    },
    temperature?: {
        unit: string,
        value: number
    }
}


type ForecastTimeType = TimeType;

export type MetForecastResponse = MetResponseType<ForecastTimeType>;

const createFormatSpecifier = (x : number, end : number) : {start : number, end : number, lines : number}  => {
    return {
        start: x,
        end: end,
        lines: 1
    }

};

const USER_AGENT = "trafikanten-hjemme vramdal@gmail.com";


class Met implements PlaylistProvider {

    _id : string;

    _forecastFetcher : ValueFetcherAndFormatter<MetForecastResponse>;
    _precipitationFetcher: ValueFetcherAndFormatter<MetPrecipitationResponse>;
    title : ?string;

    static factory : Class<MessageProviderIcalAdapter<PlaylistProvider>> ;
    static _testing : any;

    //noinspection JSUnusedLocalSymbols
    constructor(id : string, dataStore : PreemptiveCache, location : LatLong, title : ?string) {
        this._id = `Met:${title || location}`;
        this.title = title;

        this._forecastFetcher = new ValueFetcherAndFormatter(
            `${this._id}-forecast`,
            dataStore,
            XmlFetcher(`https://api.met.no/weatherapi/locationforecast/1.9/?lat=${location.latitude}&lon=${location.longitude}&msl=70`, {headers: {"User-Agent": USER_AGENT}}),
            120,
            this.formatForecast.bind(this)
        );

        this._precipitationFetcher = new ValueFetcherAndFormatter(
            `${this._id}-precipitation`,
            dataStore,
            XmlFetcher(`https://api.met.no/weatherapi/nowcast/0.9/?lat=${location.latitude}&lon=${location.longitude}`, {headers: {"User-Agent": USER_AGENT}}),
            120,
            this.formatPrecipitation.bind(this)
        )
    }

    shutdown() {}

    //noinspection JSUnusedGlobalSymbols
    getPlaylist() : PlaylistType {
        let playlist : PlaylistType = [this._forecastFetcher.getValue(), this._precipitationFetcher.getValue()];
        playlist.playlistId = "met-playlist-1";
        return playlist;
    }

    getPlaylistAsync(fresh : boolean = false) {
        return Promise.all([this._forecastFetcher.getMessageAsync(fresh), this._precipitationFetcher.getMessageAsync(fresh)]);
    }


    formatForecast(metForecast : MetForecastResponse) : Promise<MessageType> {
        if (metForecast.status === "ERROR") {
            throw new Error(metForecast.error.info.message);
        }
        const times : Array<TimeType> = metForecast.weatherdata.product.time;
        const aggregatedForecast : Array<CoercedTimeType> = aggregate(times, moment());
        //let timestampRegex = /(\d{4})-(\d{2})-(\d{2})T(\d{2})\:(\d{2})\:(\d{2})/;
        let periodText = (period : PeriodType) : [string, number, Alignments, number] => {
            switch (period) {
                case 'EVENING' : return ["kveld", 25, "center", 22812];
                case 'NIGHT' : return ["natt", 25, "center", 12192];
                case 'MORNING' : return ["morg", 25, "center", 30829];
                case 'DAY' : return ["dag", 25, "center", 12067];
                default : throw new Error("Unknown period: " + period);
            }
        };

        let symbol = (symbolName : string, symbolNumber : number) : string => {
            switch (parseInt(symbolNumber, 10)) {
                case 1 : return String.fromCharCode(30829);
                case 2 : return '░';
                case 3 : return '▒';
                case 4 : return '▓';
                case 5 : return '▒' + String.fromCharCode(62246);
                case 9 : return '▓' + String.fromCharCode(62247);
                case 10 : return '▓' + String.fromCharCode(62248);
                case 46 : return '▓' + String.fromCharCode(62246);
                case 40 : return '▒' + String.fromCharCode(62246);
                default : return symbolName;
            }
        };
        let lastStop = 0;
        let elements = [];
        aggregatedForecast.map((time : CoercedTimeType) => time.period)
            .map(periodText).forEach((periodTextAndPctWidth : [string, number, Alignments, number]) => {
                const width = Math.round(periodTextAndPctWidth[1] * 128 / 100);
                let el = [periodTextAndPctWidth[0], lastStop, lastStop + width, periodTextAndPctWidth[2]];
                lastStop = lastStop + width;
                elements.push(el);
            }
        );

        let row1 = elements.map((periodTextPosAndPxWidth : [string, number, number, Alignments]) => (
                {
                    text : periodTextPosAndPxWidth[0],
                    start : periodTextPosAndPxWidth[1],
                    end : periodTextPosAndPxWidth[2],
                    animation: {animationName: "NoAnimation",  timeoutTicks : 100, alignment : periodTextPosAndPxWidth[3]}
                }
            )
        );
        let row2 = aggregatedForecast.map((time, idx) => {
            const temperatureTxt = time.temperature && Math.round(time.temperature.value) || '';
            const symbolTxt = time.symbol && symbol(time.symbol.id, time.symbol.number) || '?';
            return ({
                text: `${temperatureTxt}°\n${symbolTxt}\n${temperatureTxt}°\n${symbolTxt}`,
                start: row1[idx].start + 128,
                end: row1[idx].end + 128,
                animation: {
                    animationName: "VerticalScrollingAnimation",
                    holdOnLine: 50,
                    holdOnLastLine: 50,
                    alignment: "center",
                    scrollIn: false,
                    scrollOut: false
                }
            });
        });


        return Promise.resolve(row1.concat(row2));
    }


    formatPrecipitation(metPrecipitation: MetPrecipitationResponse) : Promise<MessageType> {
        if (metPrecipitation.status === "ERROR") {
            throw new Error(metPrecipitation.error.info.message);
        }
        const barWidth = 6; //Math.floor(128 / yrPrecipitation.weatherdata.forecast.time.length / 2);
        let noPrecipitation = true;

        const graph = metPrecipitation.weatherdata.product.time && metPrecipitation.weatherdata.product.time
            .map(precipitationTime => parseFloat(precipitationTime.location.precipitation.value))
            .map(value => {
                if (value > 0) {
                    noPrecipitation = false;
                }
                return value;
            })
            .map(value => Math.ceil(Math.min(value / 1, 1) * 8))
            .map(value => {
                return value;
            })
            .map(eights => eights === 0 ? 8202 : 9600 + eights)
            .map(charCode => new Array(barWidth).fill(String.fromCharCode(charCode)).join(String.fromCharCode(8202)))
            .join("")
            || "Nå-varsel utilgjengelig";

        let part1 = Object.assign(
            {},
            {text: "Nedbør neste 90 min"},
            createFormatSpecifier(0, 128),
            {animation: {animationName: "NoAnimation", timeoutTicks: noPrecipitation ? 75 : 200, alignment: "center"}}
        );

        let part2 = Object.assign(
            {},
            {text: (noPrecipitation ? "Ingen" : graph)},
            createFormatSpecifier(128, 255),
            {animation: {animationName: "NoAnimation", timeoutTicks: noPrecipitation ? 75 : 200, alignment: "center"}}
        );

        return Promise.resolve([part1, part2]);
    }

}

class MetProviderFactory implements MessageProviderIcalAdapter<PlaylistProvider> {
    _dataStore: PreemptiveCache;
    _displayEventTitle: boolean;


    constructor(dataStore : PreemptiveCache, config: {}, displayEventTitle: boolean) {
        this._dataStore = dataStore;
        this._displayEventTitle = displayEventTitle;
    }

    //noinspection JSUnusedGlobalSymbols
    createMessageProvider(id : string, options : {location: Location}, title : ?string) : Met {
        return new Met(id, this._dataStore, options.location.coordinates, this._displayEventTitle && title || null);
    }
}

const aggregate = (times : Array<TimeType>, now : moment): Array<CoercedTimeType> => {
    let rows : Array<ParsedTimeType> = times.map(time => Object.assign({}, time, {to: moment(time.to), from: moment(time.from)}));
    let thisHour = now.round(1, 'hours');
    let next = thisHour.clone().add(3, 'hour').ceil(6, 'hours');
    const targetTimes = [thisHour, next, next.clone().add(6, 'hour'), next.clone().add(12, 'hour')];
    return targetTimes.map(targetTime => {
        const selectedRows : Array<ParsedTimeType> = rows.filter(time => targetTime.isBetween(time.from, time.to, null, "[]"));
        const coerceRows = (rows : Array<ParsedTimeType>) : CoercedTimeType => {
            let temperature = undefined;
            let symbol = undefined;
            let period = undefined;
            switch (targetTime.round(6, 'hours').hours()) {
                case 0 : period = 'NIGHT'; break;
                case 6 : period = 'MORNING'; break;
                case 12: period = 'DAY'; break;
                case 18: period = 'EVENING'; break;
                default: throw new Error("Unknown period for " + targetTime);
            }
            for (let i = 0; i < rows.length && (temperature === undefined || symbol === undefined) ; i++) {
                let selectedTime = rows[i];
                temperature = temperature || selectedTime.location.temperature;
                symbol = symbol || selectedTime.location.symbol && {id: selectedTime.location.symbol.id, number: parseInt(selectedTime.location.symbol.number) };
            }
            return {
                time: targetTime,
                temperature,
                symbol,
                period
            };
        };
        return coerceRows(selectedRows);
        }
    );
};

module.exports = Met;
module.exports.factory = MetProviderFactory;
module.exports._testing = {aggregate: aggregate};
