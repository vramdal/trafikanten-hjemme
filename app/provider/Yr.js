// @flow

import type {PlaylistProvider} from "./PlaylistProvider";
import type {MessageProviderIcalAdapter} from "./MessageProvider";

const Trafikanten = require("./Trafikanten.js");
const NoAnimation = require("../animations/NoAnimation.js");
const PreemptiveCache = require("../fetch/PreemptiveCache.js");
const ValueFetcherAndFormatter = require("../fetch/ValueFetcherAndFormatter.js").ValueFetcherAndFormatter;
const XmlFetcher = require("../fetch/ValueFetcherAndFormatter.js").XmlFetcher;
import type {MessageType, PlaylistType} from "../message/MessageType";
import type {Alignments} from "../animations/Types";

// const url = "http://www.yr.no/sted/Norge/Telemark/Bamble/Bamble/varsel_nu.xml";
// const url = "http://www.yr.no/sted/Norge/Nordland/Bodø/Bodø/varsel_nu.xml";
// const url = "http://www.yr.no/sted/Norge/Sør-Trøndelag/Trondheim/Trondheim/varsel_nu.xml";
// const url = "http://www.yr.no/sted//Norge/Finnmark/Vadsø/Vadsø/varsel_nu.xml";

const defaultPlace = "Norge/Oslo/Oslo/Kampen";

type LinkType = {
    text: string,
    url: string
}

type PrecipitationType = {
    unit: string,
    value: string
}

type PrecipitationTimeType = {
    from: dateStringType,
    to: dateStringType,
    precipitation: PrecipitationType
}

type dateStringType = string;

type YrPrecipitationForecastType = {
    time: Array<PrecipitationTimeType>
}

export type YrPrecipitationResponse = YrResponseType<YrPrecipitationForecastType>;

type YrResponseError = {
    error: {
        info : {
            message : string
        }
    },
    status: "ERROR"
}


type YrResponseType<T> = {
    weatherdata: {
        credit: {
            link: LinkType
        },
        meta: {
            lastupdate: string,
            nextupdate: string
        },
        forecast: T ;
    },
    status: "SUCCESS"
} | YrResponseError

type TabTime = {
    from : string,
    to: string,
    period : number,
    symbol : {
        number: number,
        numberEx : number,
        name : string,
        'var' : string
    },
    precipitation : {
        value : number
    },
    windDirection: {
        deg: number,
        code : string,
        name : string
    },
    windSpeed : {
        mps : number,
        name : string
    },
    temperature : {
        unit : string,
        value : number
    },
    pressure : {
        unit : string,
        value : number
    }
}

type ForecastType = {
    location : {
        name : string,
        time: {
            from: string,
            to: string,
            title: string,
            body: string
        }
    },
    tabular : {
        time : Array<TabTime>
    }
}

export type YrForecastResponse = YrResponseType<ForecastType>;

const createFormatSpecifier = (x : number, end : number) : {start : number, end : number, lines : number}  => {
    return {
        start: x,
        end: end,
        lines: 1
    }

};

class Yr implements PlaylistProvider {

    _id : string;

    _forecastFetcher : ValueFetcherAndFormatter<YrForecastResponse>;
    _precipitationFetcher: ValueFetcherAndFormatter<YrPrecipitationResponse>;
    title : ?string;

    static factory : Class<MessageProviderIcalAdapter<PlaylistProvider>> ;

    //noinspection JSUnusedLocalSymbols
    constructor(id : string, dataStore : PreemptiveCache, place : string = defaultPlace, title : ?string) {
        this._id = `Yr:${place}`;
        this.title = title;

        this._forecastFetcher = new ValueFetcherAndFormatter(
            `${this._id}-forecast`,
            dataStore,
            XmlFetcher("http://www.yr.no/sted/" + place + "/varsel.xml"),
            120,
            this.formatForecast.bind(this)
        );

        this._precipitationFetcher = new ValueFetcherAndFormatter(
            `${this._id}-precipitation`,
            dataStore,
            XmlFetcher("http://www.yr.no/sted/" + place + "/varsel_nu.xml"),
            120,
            this.formatPrecipitation.bind(this)

        )
    }

    shutdown() {}

    //noinspection JSUnusedGlobalSymbols
    getPlaylist() : PlaylistType {
        /*        return [{
         text: "Værvarsel fra Yr, levert av NRK og Meteorologisk institutt",
         start: 0, end: 128, lines: 2,
         animation: {
         animationName: "VerticalScrollingAnimation",
         holdOnLine: 5
         }}].concat(*/
        let playlist : PlaylistType = [this._forecastFetcher.getValue(), this._precipitationFetcher.getValue()];
        playlist.playlistId = "yr-playlist-1";
        return playlist;
    }

    getPlaylistAsync(fresh : boolean = false) {
        return Promise.all([this._forecastFetcher.getMessageAsync(fresh), this._precipitationFetcher.getMessageAsync(fresh)]);
    }


    formatForecast(yrForecast : YrForecastResponse) : Promise<MessageType> {
        if (yrForecast.status === "ERROR") {
            throw new Error(yrForecast.error.info.message);
        }
        const times : Array<TabTime> = yrForecast.weatherdata.forecast.tabular.time.filter((time, idx) => idx < 4);
        //let timestampRegex = /(\d{4})-(\d{2})-(\d{2})T(\d{2})\:(\d{2})\:(\d{2})/;
        let periodText = (period : number) : [string, number, Alignments, number] => {
            switch (parseInt(period)) {
                case 0 : return ["natt", 25, "center", 22812];
                case 1 : return ["morg", 25, "center", 12192];
                case 2 : return ["dag", 25, "center", 30829];
                case 3 : return ["kvld", 25, "center", 12067];
                default : throw new Error("Unknown period: " + period);
            }
        };

        let symbol = (symbolNum : (number | string)) : string => {
            switch (parseInt(symbolNum, 10)) {
                case 1 : return String.fromCharCode(30829);
                case 4 : return '▓';
                case 5 : return '▒' + String.fromCharCode(62246);
                case 3 : return '▒';
                case 2 : return '░';
                case 9 : return '▓' + String.fromCharCode(62247);
                case 10 : return '▓' + String.fromCharCode(62248);
                case 46 : return '▓' + String.fromCharCode(62246);
                case 40 : return '▒' + String.fromCharCode(62246);
                default : return symbolNum + "";
            }
        };
        let lastStop = 0;
        let elements = [];
        times.map(time => time.period).map(periodText).forEach((periodTextAndPctWidth : [string, number, Alignments, number]) =>
            {
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
        let row2 = times.map((time, idx) => ( {
            text : `${time.temperature.value}°\n${symbol(time.symbol.numberEx)}\n${time.temperature.value}°\n${symbol(time.symbol.numberEx)}`,
            start : row1[idx].start + 128,
            end : row1[idx].end + 128,
            animation: {animationName: "VerticalScrollingAnimation",  holdOnLine : 50, holdOnLastLine : 50, alignment: "center", scrollIn : false, scrollOut: false}
        } ));


        return Promise.resolve(row1.concat(row2));
    }


    formatPrecipitation(yrPrecipitation: YrPrecipitationResponse) : Promise<MessageType> {
        if (yrPrecipitation.status === "ERROR") {
            throw new Error(yrPrecipitation.error.info.message);
        }
        const barWidth = 6; //Math.floor(128 / yrPrecipitation.weatherdata.forecast.time.length / 2);
        let noPrecipitation = true;

        const graph = yrPrecipitation.weatherdata.forecast.time && yrPrecipitation.weatherdata.forecast.time
                .map(precipitationTime => parseFloat(precipitationTime.precipitation.value))
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

class YrProviderFactory implements MessageProviderIcalAdapter<PlaylistProvider> {
    _dataStore: PreemptiveCache;
    _displayEventTitle: boolean;


    constructor(dataStore : PreemptiveCache, config: {}, displayEventTitle: boolean) {
        this._dataStore = dataStore;
        this._displayEventTitle = displayEventTitle;
    }

    //noinspection JSUnusedGlobalSymbols
    createMessageProvider(id : string, options : {locationString : string}, title : ?string) : Yr {
        return new Yr(id, this._dataStore, options.locationString, this._displayEventTitle && title || null);
    }
}

module.exports = Yr;
module.exports.factory = YrProviderFactory;
