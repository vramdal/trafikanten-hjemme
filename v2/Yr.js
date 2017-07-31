// @flow

const fetch = require("node-fetch");
const xml2json = require("xml2json");
const Trafikanten = require("./Trafikanten.js");
const Scrolling = require("./animations/Scrolling.js");
const NoAnimation = require("./animations/NoAnimation.js");
const PreemptiveCache = require("./fetch/PreemptiveCache.js");
import type {MessageType} from "./message/MessageType";
import type {CachedValueProvider} from "./fetch/Cache";
import type {ContentProvider} from "./provider/ContentProvider";

const url = "http://www.yr.no/sted/Norge/Oslo/Oslo/Kampen/varsel_nu.xml";
// const url = "http://www.yr.no/sted/Norge/Telemark/Bamble/Bamble/varsel_nu.xml";
// const url = "http://www.yr.no/sted/Norge/Nordland/Bodø/Bodø/varsel_nu.xml";
// const url = "http://www.yr.no/sted/Norge/Sør-Trøndelag/Trondheim/Trondheim/varsel_nu.xml";
// const url = "http://www.yr.no/sted//Norge/Finnmark/Vadsø/Vadsø/varsel_nu.xml";

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

export type YrPrecipitationType = {
    weatherdata: {
        credit: {
            link: LinkType
        },
        meta: {
            lastupdate: string,
            nextupdate: string
        },
        forecast: {
            time: Array<PrecipitationTimeType>
        }
    }
}

class Yr implements ContentProvider {

    _cachedValueProvider : CachedValueProvider<YrPrecipitationType>;
    _id : string;

    constructor(id : string, dataStore : PreemptiveCache) {
        this._id = id;
        this._cachedValueProvider = dataStore.registerFetcher(this.fetch.bind(this), url, 30, 3);
    }

    fetch() {
        return fetch(url)
            .then(res => res.text())
            .then(body => Promise.resolve(xml2json.toJson(body)))
            .then(json => JSON.parse(json))
    }

    getContent() {
        return this._cachedValueProvider()
            .then(response => this.format(response))
            .catch(err => [Object.assign({},
                { start: 0, end: 127, text: "Loading data for " + this._id, lines: 2},
                { animation: {animationName : "VerticalScrollingAnimation", holdOnLine: 50}})])
    }

    format(yrPrecipitation : YrPrecipitationType) : MessageType {

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