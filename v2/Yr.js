// @flow

const fetch = require("node-fetch");
const xml2json = require("xml2json");
const Trafikanten = require("./Trafikanten.js");
const Scrolling = require("./animations/Scrolling.js");
const NoAnimation = require("./animations/NoAnimation.js");
const PreemptiveCache = require("./fetch/PreemptiveCache.js");
import type {MessageType} from "./message/MessageType";
import type {Alignments} from "./animations/Types";
import type {CachedValueProvider} from "./fetch/Cache";
import type {ContentProvider} from "./provider/ContentProvider";

const nowPrecipitationUrl = "http://www.yr.no/sted/Norge/Oslo/Oslo/Kampen/varsel_nu.xml";
// const url = "http://www.yr.no/sted/Norge/Telemark/Bamble/Bamble/varsel_nu.xml";
// const url = "http://www.yr.no/sted/Norge/Nordland/Bodø/Bodø/varsel_nu.xml";
// const url = "http://www.yr.no/sted/Norge/Sør-Trøndelag/Trondheim/Trondheim/varsel_nu.xml";
// const url = "http://www.yr.no/sted//Norge/Finnmark/Vadsø/Vadsø/varsel_nu.xml";

const place = "Norge/Oslo/Oslo/Kampen";

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
    }
}

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

class Yr implements ContentProvider {

    _nowPrecipitationValueProvider : CachedValueProvider<YrPrecipitationResponse>;
    _id : string;
    _nowPrecipitationUrl : string;
    _forecastUrl : string;
    _forecastValueProvider : CachedValueProvider<YrForecastResponse>;

    constructor(id : string, dataStore : PreemptiveCache) {
        this._id = id;
        this._nowPrecipitationUrl = "http://www.yr.no/sted/" + place + "/varsel_nu.xml";
        this._forecastUrl = "http://www.yr.no/sted/" + place + "/varsel.xml";
        this._nowPrecipitationValueProvider = dataStore.registerFetcher(this.fetchNowPrecipitation.bind(this), this._nowPrecipitationUrl, 120, 3);
        this._forecastValueProvider = dataStore.registerFetcher(this.fetchForecast.bind(this), this._forecastUrl, 60*10, 3);
    }

    fetchNowPrecipitation() {
        return fetch(this._nowPrecipitationUrl)
            .then(res => res.text())
            .then(body => Promise.resolve(xml2json.toJson(body)))
            .then(json => JSON.parse(json))
    }

    fetchForecast() {
        return fetch(this._forecastUrl)
            .then(res => res.text())
            .then(body => Promise.resolve(xml2json.toJson(body)))
            .then(json => JSON.parse(json))
    }

    getContent() {
/*        return [{
            text: "Værvarsel fra Yr, levert av NRK og Meteorologisk institutt",
            start: 0, end: 128, lines: 2,
            animation: {
                animationName: "VerticalScrollingAnimation",
                holdOnLine: 5
            }}].concat(*/
/*
        return this._nowPrecipitationValueProvider()
            .then(response => this.formatPrecipitation(response))
            .catch(err => [Object.assign({},
                { start: 0, end: 127, text: "Loading data for " + this._id, lines: 2},
                { animation: {animationName : "VerticalScrollingAnimation", holdOnLine: 50}})])
*/
        return this._forecastValueProvider()
            .then(response => this.formatForecast(response))
            .catch(err => [Object.assign({},
                { start: 0, end: 127, text: "Loading data for " + this._id, lines: 2},
                { animation: {animationName : "VerticalScrollingAnimation", holdOnLine: 50}})]
            )
    }

    formatForecast(yrForecast : YrForecastResponse) : MessageType {
        const times : Array<TabTime> = yrForecast.weatherdata.forecast.tabular.time.filter((time, idx) => idx < 4);
        let timestampRegex = /(\d{4})-(\d{2})-(\d{2})T(\d{2})\:(\d{2})\:(\d{2})/;
        let periodText = (period : number) : [string, number, Alignments] => {
            switch (parseInt(period)) {
                case 0 : return ["natt", 25, "left"];
                case 1 : return ["morgen", 32, "left"];
                case 2 : return ["dag", 15, "left"];
                case 3 : return ["kveld", 28, "left"];
                default : throw new Error("Unknown period: " + period);
            }
        };
        //let row1 = times.map(time => `${timestampRegex.exec(time.from)[4]}-${timestampRegex.exec(time.to)[4]}`).join(" ");
        let lastStop = 0;
        let elements = [];
        times.map(time => time.period).map(periodText).forEach((periodTextAndPctWidth : [string, number, Alignments], idx : number, array : Array<[string, number, Alignments]>) =>
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
                text : `${time.temperature.value}° ${time.symbol.numberEx}`,
                start : row1[idx].start + 128,
                end : row1[idx].end + 128,
                animation: {animationName: "VerticalScrollingAnimation",  holdOnLine : 50, holdOnLastLine : 50}
        } ));

        //let row2 = times.map(time => time.temperature.value + "grd-" + time.symbol.name).join(" ");
        return row1.concat(row2);
    }

    formatPrecipitation(yrPrecipitation : YrPrecipitationResponse) : MessageType {

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
                console.log(value);
                return value;
            })
            .map(eights => eights === 0 ? 8202 : 9600 + eights)
            .map(charCode => new Array(barWidth).fill(String.fromCharCode(charCode)).join(String.fromCharCode(8202)))
            .join("")
        || "Nå-varsel utilgjengelig";

        let part1 = Object.assign(
            {},
            {text: "Nedbør neste 90 min"},
            Trafikanten.createFormatSpecifier(0, 128),
            {animation: {animationName: "NoAnimation", timeoutTicks: 200, alignment: "center"}}
        );

        let part2 = Object.assign(
            {},
            {text: (noPrecipitation ? "Ingen" : graph)},
            Trafikanten.createFormatSpecifier(128, 255),
            {animation: {animationName: "NoAnimation", timeoutTicks: 200, alignment: "center"}}
        );
        
        return [part1, part2];
    }

}

module.exports = Yr;