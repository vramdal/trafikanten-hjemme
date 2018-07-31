// @flow

const NoAnimation = require("../animations/NoAnimation.js");
const PreemptiveCache = require("../fetch/PreemptiveCache.js");
const ValueFetcherAndFormatter = require("../fetch/ValueFetcherAndFormatter.js").ValueFetcherAndFormatter;
const JsonFetcher = require("../fetch/ValueFetcherAndFormatter.js").JsonFetcher;

type MonitoredCall = {
    ExpectedDepartureTime : string
}

import type {MessageType, AnimationType, MessagePartType} from "../message/MessageType";
import type {MessageProvider} from "./MessageProvider";


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

function getLoadingMessage(id : string) {
    return [Object.assign({},
        {start: 0, end: 127, text: "Loading data for " + id, lines: 2},
        {animation: {animationName: "VerticalScrollingAnimation", holdOnLine: 50}})];
}

class Trafikanten implements MessageProvider {

    id : string;
    _valueFetcher : ValueFetcherAndFormatter<GetDeparturesResponse>;

    static createFormatSpecifier(x : number, end : number) : {start : number, end : number, lines : number} {
        return createFormatSpecifier.apply(this, arguments);
    }

    constructor(id : string, dataStore : PreemptiveCache) {
        this.id = id;
        this._valueFetcher = new ValueFetcherAndFormatter(id,
                dataStore,
                JsonFetcher("http://reisapi.ruter.no/StopVisit/GetDepartures/3011430"),
                30,
                this.format.bind(this),
                10,
                getLoadingMessage(id)
            );
    }

    //noinspection JSUnusedGlobalSymbols
    getMessage() : ?MessageType {
        return this._valueFetcher.getValue();
    }

    getMessageAsync(fresh : boolean) : Promise<MessageType> {
        return this._valueFetcher.getMessageAsync(fresh);
    }

    shutdown() {

    }

    format(getDeparturesResponse : GetDeparturesResponse) : Promise<MessageType> {
        let now = new Date().getTime();
        let departures = getDeparturesResponse.filter(departure =>
            new Date(departure.MonitoredVehicleJourney.MonitoredCall.ExpectedDepartureTime).getTime() > now + 5 * 60 * 1000
        );
        let firstDeparture : MonitoredVehicleJourney = departures[0].MonitoredVehicleJourney;
        let noAnimation : AnimationType = {animationName : "NoAnimation", timeoutTicks: 5, alignment: "left"};
        let part1 : MessagePartType = Object.assign(
            {},
            {text: firstDeparture.LineRef + " " + firstDeparture.DestinationName},
            Trafikanten.createFormatSpecifier(0, 100),
            {animation: noAnimation}
        );
        let part2 : MessagePartType= Object.assign(
            {},
            { text: this.formatTime(new Date(firstDeparture.MonitoredCall.ExpectedDepartureTime).getTime())},
            Trafikanten.createFormatSpecifier(100, 127),
            {animation: {animationName : "NoAnimation", timeoutTicks: 5, alignment: "right"}}
        );
        let formatted = departures.slice(1).slice(0, 5).map((monitoredStopVisit : MonitoredStopVisit) => {
            let journey = monitoredStopVisit.MonitoredVehicleJourney;
            return this.formatJourney(journey);
        });
        let secondLine : MessagePartType = Object.assign(
            {},
            {text: formatted.join("  -  ")},
            Trafikanten.createFormatSpecifier(128, 255), {animation: {animationName: "ScrollingAnimation"}}
        );
        let message : MessageType = [part1, part2, secondLine];
        message.messageId = "trafikanten-1";
        return Promise.resolve(message);
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