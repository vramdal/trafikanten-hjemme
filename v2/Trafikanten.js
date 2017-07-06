// @flow

const SimpleTypes = require("./SimpleTypes.js");
const Scrolling = require("./animations/Scrolling.js");
const NoAnimation = require("./animations/NoAnimation.js");
import type {Animation} from "./animations/Animation";
type MonitoredCall = {
    ExpectedDepartureTime : string
}



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

const createFormatSpecifier = (x : number, end : number, animationClass: Class<$Subtype<Animation>>, ...animationParameters: Array<number>) : string => {
    let animationId : string;
    switch (animationClass) {
        case NoAnimation : animationId = "\x01"; break;
        case Scrolling : animationId = "\x02"; break;
        default : animationId = "\x01";
    }
    return SimpleTypes.FORMAT_SPECIFIER_START +
        String.fromCharCode(x) +
        String.fromCharCode(end) +
        "\x01" +
        animationId +
        animationParameters.map((param : number) => String.fromCharCode(param)).join("")
        + SimpleTypes.FORMAT_SPECIFIER_END;

};

class Trafikanten {

    static createFormatSpecifier(x : number, end : number, animationClass: Class<$Subtype<Animation>>, ...animationParameters: Array<number>) {
        return createFormatSpecifier.apply(this, arguments);
    }

    formatMessage(getDeparturesResponse : GetDeparturesResponse) {

        let firstDeparture : MonitoredVehicleJourney = getDeparturesResponse[0].MonitoredVehicleJourney;
        let firstLine = Trafikanten.createFormatSpecifier(0, 12, NoAnimation, 5, 2) +
            firstDeparture.LineRef +
            Trafikanten.createFormatSpecifier(17, 100, NoAnimation, 5, 0) +
            firstDeparture.DestinationName +
            Trafikanten.createFormatSpecifier(100, 127, NoAnimation, 5, 2) +
            this.formatTime(new Date(firstDeparture.MonitoredCall.ExpectedDepartureTime).getTime())
        ;

        let formatted = getDeparturesResponse.slice(1).map((monitoredStopVisit : MonitoredStopVisit) => {
            let journey = monitoredStopVisit.MonitoredVehicleJourney;
            return this.formatJourney(journey);
        });
        let secondLine = Trafikanten.createFormatSpecifier(128, 255, Scrolling) + formatted.join("  -  ");
        return firstLine + secondLine;
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