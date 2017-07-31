// @flow

const SimpleTypes = require("./SimpleTypes.js");
const Scrolling = require("./animations/Scrolling.js");
const NoAnimation = require("./animations/NoAnimation.js");
const testdata1 = require("./testdata/ensjø-departures-1.json");
const testdata2 = require("./testdata/ensjø-departures-2.json");
const PreemptiveCache = require("./fetch/PreemptiveCache.js");

type MonitoredCall = {
    ExpectedDepartureTime : string
}

import type {MessageType, AnimationType, MessagePartType} from "./message/MessageType";
import type {CachedValueProvider} from "./fetch/Cache";
import type {ContentFetcher} from "./fetch/ContentFetcher";
import type {ContentProvider} from "./provider/ContentProvider";


type MonitoredVehicleJourney = {
    LineRef : string,
    DirectionRef: string,
    DestinationName: string,
    MonitoredCall : MonitoredCall
}

type MonitoredStopVisit = {
    MonitoredVehicleJourney : MonitoredVehicleJourney
};
type GetDeparturesResponse = Array<MonitoredStopVisit>;

const createFormatSpecifier = (x : number, end : number) : {start : number, end : number, lines : number}  => {
    return {
        start: x,
        end: end,
        lines: 1
    }

};

class Trafikanten implements ContentProvider, ContentFetcher<GetDeparturesResponse> {

    _content : MessageType;
    fetchIntervalSeconds : number;
    id : string;
    _cachedValueProvider : CachedValueProvider<GetDeparturesResponse>;
    maxErrorCount : number;
    currentContent : string;

    static createFormatSpecifier(x : number, end : number) : {start : number, end : number, lines : number} {
        return createFormatSpecifier.apply(this, arguments);
    }

    constructor(id : string, fetcher : PreemptiveCache) {
        this._content = [];
        this.id = id;
        this.fetchIntervalSeconds = 10;
        this._cachedValueProvider = fetcher.registerFetcher(this);
        this.maxErrorCount = 3;
        this.currentContent = "";
    }

    //noinspection JSUnusedGlobalSymbols
    fetch() : Promise<GetDeparturesResponse> {
        let shouldError = Math.random() > 0.9;
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                if (shouldError) {
                    return reject(new Error("Trafikanten fetching error"));
                }
                resolve(this.id === "1" ? testdata1 : testdata2);
            }, Math.random() * (2000 - 1000) + 1000);
        });
    }

    getContent() : Promise<MessageType> {
        return this._cachedValueProvider()
            .then(response => this.format(response))
            .catch(err => [Object.assign({},
                { start: 0, end: 127, text: "Loading data for " + this.id, lines: 2},
                { animation: {animationName : "VerticalScrollingAnimation", holdOnLine: 50}})])
            .then(currentMessage => {
                const str = JSON.stringify(currentMessage);
                if (this.currentContent !== str) {
                    console.info("Oppdatert innhold");
                }
                return currentMessage
            })
    }

    format(getDeparturesResponse : GetDeparturesResponse) : MessageType {
        let firstDeparture : MonitoredVehicleJourney = getDeparturesResponse[0].MonitoredVehicleJourney;
        let noAnimation : AnimationType = {animationName : "NoAnimation", timeoutTicks: 5, alignment: "right"};
        let part1 : MessagePartType = Object.assign(
            {},
            {text: firstDeparture.LineRef},
            Trafikanten.createFormatSpecifier(0, 12),
            {animation: noAnimation}
        );
        let part2 : MessagePartType = Object.assign(
            {},
            {text: firstDeparture.DestinationName},
            Trafikanten.createFormatSpecifier(17, 100),
            {animation: {animationName : "NoAnimation", timeoutTicks: 5, alignment: "left"}}
        );
        let part3 : MessagePartType= Object.assign(
            {},
            { text: this.formatTime(new Date(firstDeparture.MonitoredCall.ExpectedDepartureTime).getTime())},
            Trafikanten.createFormatSpecifier(100, 127),
            {animation: noAnimation}
        );
        let formatted = getDeparturesResponse.slice(1).map((monitoredStopVisit : MonitoredStopVisit) => {
            let journey = monitoredStopVisit.MonitoredVehicleJourney;
            return this.formatJourney(journey);
        });
        let secondLine : MessagePartType = Object.assign(
            {},
            {text: formatted.join("  -  ")},
            Trafikanten.createFormatSpecifier(128, 255), {animation: {animationName: "ScrollingAnimation"}}
        );
        let message : MessageType = [part1, part2, part3, secondLine];
        message.id = "trafikanten-1";
        return message;
    }

    formatJourney(journey : MonitoredVehicleJourney) {
        return journey.LineRef + " " + journey.DestinationName + "  " + this.formatTime(new Date(journey.MonitoredCall.ExpectedDepartureTime).getTime());
    }


//noinspection JSMethodCanBeStatic
    formatTime(timestamp : number) {
        let departureTime = {
            seconds: timestamp / 1000,
            minutes: timestamp / 1000 / 60
        };
        let nowMs = new Date().getTime();
        let now = {
            seconds: nowMs / 1000,
            minutes: nowMs / 1000 / 60
        };
        if (departureTime.seconds - now.seconds < 45) {
            return "nå";
        } else if (departureTime.seconds - now.seconds < 60) {
            return "1 min";
        } else if (departureTime.minutes - now.minutes < 10) {
            return (Math.floor(departureTime.minutes - now.minutes)) + " min";
        } else {
            let d = new Date();
            d.setTime(timestamp);
            let hours = d.getHours();
            hours = (hours < 10 ? "0" : "") + hours;
            let minutes = d.getMinutes();
            minutes = (minutes < 10 ? "0" : "") + minutes;
            return hours + ":" + minutes;
        }
    }

}

module.exports = Trafikanten;