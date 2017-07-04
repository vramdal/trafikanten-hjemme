// @flow

const fetch = require("node-fetch");
const xml2json = require("xml2json");
const Trafikanten = require("./Trafikanten.js");
const Scrolling = require("./animations/Scrolling.js");
const NoAnimation = require("./animations/NoAnimation.js");
const SimpleTypes = require("./SimpleTypes.js");

// const url = "http://www.yr.no/sted/Norge/Oslo/Oslo/Kampen/varsel_nu.xml";
// const url = "http://www.yr.no/sted/Norge/Telemark/Bamble/Bamble/varsel_nu.xml";
// const url = "http://www.yr.no/sted/Norge/Nordland/Bodø/Bodø/varsel_nu.xml";
const url = "http://www.yr.no/sted/Norge/Sør-Trøndelag/Trondheim/Trondheim/varsel_nu.xml";

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

class Yr {

    constructor() {
    }

    fetch() {
        return fetch(url)
            .then(res => res.text())
            .then(body => Promise.resolve(xml2json.toJson(body)))
            .then(json => JSON.parse(json))
    }

    format(yrPrecipitation : YrPrecipitationType) : string {

        const barWidth = 6; //Math.floor(128 / yrPrecipitation.weatherdata.forecast.time.length / 2);
        let noPrecipitation = true;

        const graph = yrPrecipitation.weatherdata.forecast.time
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
            .join("");

        return Trafikanten.createFormatSpecifier(0, 128, NoAnimation, 100)
            + (noPrecipitation ? "" : "\x02Nedbør neste 90 min")
            //+ yrPrecipitation.weatherdata.credit.link.text
            + SimpleTypes.MESSAGE_PART_SEPARATOR
            + Trafikanten.createFormatSpecifier(128, 255, NoAnimation, 100)
            + "\x02"
            + (noPrecipitation ? "Ingen" : graph)
    }

}

module.exports = Yr;