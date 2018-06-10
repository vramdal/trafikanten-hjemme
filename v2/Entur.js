// @flow
import type {MessageType, AnimationType, MessagePartType} from "./message/MessageType";
import type {MessageProvider, MessageProviderIcalAdapter} from "./provider/MessageProvider";
import type {Location} from './Place';

const ValueFetcherAndFormatter = require("./fetch/ValueFetcherAndFormatter.js").ValueFetcherAndFormatter;
const GraphQLFetcher = require("./fetch/ValueFetcherAndFormatter.js").GraphQLFetcher;
const PreemptiveCache = require("./fetch/PreemptiveCache.js");
const apiUrl = "https://api.entur.org/journeyplanner/2.0/index/graphql";
// const telemarksvingenLatLong = [59.914240562735536,10.783734648356184];
//noinspection JSUnusedLocalSymbols
const fokushallenLatLong = [59.89906, 10.8105978];
// const jobbLatLong = [59.9151881,10.7521706];
const settings = require("./settings");
const graphQlQuery = `
# Welcome to GraphiQL
##################
# GraphiQL is an in-browser IDE for writing, validating, and
# testing GraphQL queries.
#
# Type queries into this side of the screen, and you will
# see intelligent typeaheads aware of the current GraphQL type schema and
# live syntax and validation errors highlighted within the text.
#
# To bring up the auto-complete at any point, just press Ctrl-Space.
#
# Press the run button above, or Cmd-Enter to execute the query, and the result
# will appear in the pane to the right.
#
#
#
################## Example query for planning a journey
#### Arguments
query ($dateTime: DateTime!, $from: Location!, $to: Location!)
{
  trip(
    from: $from
    to: $to
    numTripPatterns: 5
    dateTime: $dateTime
    minimumTransferTime: 180
    walkSpeed: 1.3
    wheelchair: false
    arriveBy: false
    modes: [transit, foot]
    allowBikeRental:false
  )

#### Requested fields
  {
    fromPlace {
      name
    }
    toPlace {
      name
    }
    messageEnums
    messageStrings
    tripPatterns {
      startTime
      duration
      walkDistance

          legs {
          	expectedStartTime
            mode
            distance
            fromPlace {
              name
            }
            toPlace {
              name
            }
            serviceJourney {
              journeyPattern {
                destinationDisplay {
                  frontText
                }
              }
              line {
                publicCode
              }
            }
          }
    }
  }
}`;

const home = settings.get("home");

/**
 * DateTime format accepting ISO dates. Return values on format: yyyy-MM-dd'T'HH:mm:ssXXXX. Example: 2017-04-23T18:25:43+0100
 */
type DateTimeStr = string;

type Place = {
    name : ?string,
    latitude: number,
    longitude: number
}

type ID = string;

type TransportMode =
    "air"
    | "bus"
    | "cableway"
    | "water"
    | "funicular"
    | "lift"
    | "rail"
    | "metro"
    | "tram"
    | "coach"
    | "unknown"

type Line = {
    id: ID,
    publicCode: ?string,
    name: ?string,
    transportMode: ?TransportMode,
    description: string,

}

type Mode = "air"
    | "bicycle"
    | "bus"
    | "cableway"
    | "car"
    | "water"
    | "funicular"
    | "lift"
    | "rail"
    | "metro"
    | "tram"
    | "coach"
    | "transit"
    | "foot"
    | "car_park"
    | "car_pickup"


type PointsOnLink = {
    length: ?number,
    points: ?string
}

type DestinationDisplay = {
    frontText: ?string
}

type JourneyPattern = {
    id: ID,
    line: Line,
    name: ?string,
    destinationDisplay: ?DestinationDisplay,
}

type ServiceJourney = {
    id: ID,
    line: Line,
    journeyPattern : ?JourneyPattern
}

type Leg = {
    aimedStartTime: ?DateTimeStr,
    expectedStartTime: ?DateTimeStr,
    aimedEndTime: ?DateTimeStr,
    expectedEndTime: ?DateTimeStr,
    mode: ?Mode,
    duration: ?number,
    pointsOnLink: ?PointsOnLink,
    realtime: ?boolean,
    distance: ?number,
    ride: ?boolean,
    rentedBike: ?boolean,
    fromPlace: Place,
    toPlace: Place,
    line: Line,
    serviceJourney : ServiceJourney
}

type TripPattern = {
    startTime: ?DateTimeStr,
    endTime: ?DateTimeStr,
    duration: ?number,
    waitingTime: ?number,
    walkTime: ?number,
    legs: [Leg],
    weight: ?number
}

type Trip = {
    dateTime : ?DateTimeStr,
    fromPlace: ?Place,
    toPlace: ?Place,
    tripPatterns: [TripPattern],
    messageEnums : [string],
    messageStrings : [string]
}

type EnturTripResponseBodyData = {
    trip: Trip
}

type config = {
    fetchIntervalSeconds?: number,
    formatIntervalSeconds?: number,
    graphQLFetcherFactory?: (apiUrl: string, headers: any, graphQLQuery: string, variables: any) => () => Promise<any>;
}

function graphQLFetcherFactory(apiUrl: string, headers, graphQLQuery: string, variables) {
    return GraphQLFetcher(apiUrl, headers, graphQLQuery, () => variables);
}

class Entur implements MessageProvider {

    id : string;
    _valueFetcher : ValueFetcherAndFormatter<EnturTripResponseBodyData>;

    static factory : Class<MessageProviderIcalAdapter<MessageProvider>>;

    //noinspection JSUnusedLocalSymbols
    constructor(id : string, dataStore : PreemptiveCache, from: Location, to : Location, config? : config = {}) {
        const variables = {
            //"dateTime": "2018-06-04T12:51:14.000+0100",
            "dateTime": new Date().toISOString(),
            "from": {
                "name": "Telemarksvingen 8, Oslo",
                "coordinates": {
                    "latitude": home.coordinates.latitude,
                    "longitude":home.coordinates.longitude
                }
            },
            "to": {
                name: to.name,
                coordinates: {
                    latitude: to.coordinates.latitude,
                    longitude: to.coordinates.longitude
                }
            } /*{
                "coordinates": {
                    "latitude": jobbLatLong[0],
                    "longitude": jobbLatLong[1]
                },
                "name": "Fokushallen"*/
        };
        this.id = id;
        let headers = {
            'ET-Client-Name': 'trafikanten-hjemme'
        };
        this._valueFetcher = new ValueFetcherAndFormatter(id,
            dataStore,
            config.graphQLFetcherFactory ? config.graphQLFetcherFactory(apiUrl, headers, graphQlQuery, variables) : graphQLFetcherFactory(apiUrl, headers, graphQlQuery, variables),
            config.fetchIntervalSeconds || 30,
            this.format.bind(this),
            config.formatIntervalSeconds || 10,
            [Object.assign({},
                {start: 0, end: 127, text: "Loading data for " + this.id, lines: 2},
                {animation: {animationName: "VerticalScrollingAnimation", holdOnLine: 50}})]
        )
    }

    static transportModeFilter(mode : ?Mode) : boolean {
        switch (mode) {

            case "bus" :
            case "cableway" :
            case "water" :
            case "funicular" :
            case "lift" :
            case "rail" :
            case "metro" :
            case "tram" :
            case "coach" :
            case "transit" :
                return true;
            case "foot" :
            case "air" :
            case "bicycle" :
            case "car" :
            case "car_park" :
            case "car_pickup" :
                return false;
            default :
                return false;
        }
    }

    //noinspection JSUnusedGlobalSymbols
    getMessage() : ?MessageType {
        return this._valueFetcher.getValue();
    }

    getMessageAsync(fresh : boolean = false) {
        return this._valueFetcher.getMessageAsync(fresh);
    }

    format(enturTripResponseBodyData : EnturTripResponseBodyData) : Promise<MessageType> {
        let tripPatterns = enturTripResponseBodyData.trip.tripPatterns
            && enturTripResponseBodyData.trip.tripPatterns.filter(tripPattern =>
                tripPattern.legs.filter((leg : Leg) => Entur.transportModeFilter(leg.mode)).length > 0
            );
        let startLegs : Array<Leg> = tripPatterns
            .map((tripPattern : TripPattern) => tripPattern.legs
                .filter((leg : Leg) => Entur.transportModeFilter(leg.mode) && leg.serviceJourney && leg.serviceJourney.journeyPattern)[0]);
        if (startLegs.length === 0 && enturTripResponseBodyData.trip.messageEnums.length > 0) {
            return Promise.resolve([Object.assign({},
                {start: 0, end: 127, text:  `${enturTripResponseBodyData.trip.messageStrings[0]} (${this.id}, ${enturTripResponseBodyData.trip.messageEnums[0]})`, lines: 2},
                {animation: {animationName: "VerticalScrollingAnimation", holdOnLine: 50}})]);

        } else if (startLegs.length === 0
            && enturTripResponseBodyData.trip.fromPlace
            && enturTripResponseBodyData.trip.fromPlace.name
            && enturTripResponseBodyData.trip.toPlace
            && enturTripResponseBodyData.trip.toPlace.name) {
            return Promise.resolve([Object.assign({},
                {start: 0, end: 127, text:  `Ingen avganger fra ${enturTripResponseBodyData.trip.fromPlace.name} til ${enturTripResponseBodyData.trip.toPlace.name} (${this.id})`, lines: 2},
                {animation: {animationName: "VerticalScrollingAnimation", holdOnLine: 50}})]);
        } else if (startLegs.length === 0) {
            return Promise.resolve([Object.assign({},
                {start: 0, end: 127, text:  `Ingen avganger (${this.id})`, lines: 2},
                {animation: {animationName: "VerticalScrollingAnimation", holdOnLine: 50}})]);
        }
        startLegs.sort((leg1 : Leg, leg2 : Leg) => {

            return (leg1.expectedStartTime || "") > (leg2.expectedStartTime || "") ? 1 : 0;
        });
        let firstDeparture : Leg = startLegs[0];
        let noAnimation : AnimationType = {animationName : "NoAnimation", timeoutTicks: 5, alignment: "left"};
        let part1 : MessagePartType = Object.assign(
            {},
            {text: (firstDeparture.serviceJourney && firstDeparture.serviceJourney.line.publicCode || "") + " " + (firstDeparture.serviceJourney.journeyPattern && firstDeparture.serviceJourney.journeyPattern.destinationDisplay && firstDeparture.serviceJourney.journeyPattern.destinationDisplay.frontText  || "")},
            createFormatSpecifier(0, 100),
            {animation: noAnimation}
        );
        let part2 : MessagePartType= Object.assign(
            {},
            { text: firstDeparture.expectedStartTime && this.formatTime(new Date(firstDeparture.expectedStartTime).getTime()) || ""},
            createFormatSpecifier(100, 127),
            {animation: {animationName : "NoAnimation", timeoutTicks: 5, alignment: "right"}}
        );
        let formatted = startLegs.slice(1).slice(0, 5).map(this.formatLeg.bind(this));
        let secondLine : MessagePartType = Object.assign(
            {},
            {text: formatted.join("  -  ")},
            createFormatSpecifier(128, 255), {animation: {animationName: "ScrollingAnimation"}}
        );
        let message : MessageType = [part1, part2, secondLine];
        message.messageId = this.id;
        return Promise.resolve(message);

    }

    formatLeg(leg : Leg) : string {
        if (!(leg.serviceJourney && leg.serviceJourney.journeyPattern && leg.serviceJourney.line) ) {
            return "";
        }
        return (leg.serviceJourney.line.publicCode || "")
            + " "
            + (leg.serviceJourney.journeyPattern
            && leg.serviceJourney.journeyPattern.destinationDisplay
            && leg.serviceJourney.journeyPattern.destinationDisplay.frontText || "") + " " + (leg.expectedStartTime && this.formatTime(new Date(leg.expectedStartTime).getTime()) || "")
    }

    //noinspection JSMethodCanBeStatic
    formatTime(timestamp : number) : string {
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

    toString() {
        return this.id;
    }

    shutdown() {
        this._valueFetcher.shutdown();
    }

}

const createFormatSpecifier = (x : number, end : number) : {start : number, end : number, lines : number}  => {
    return {
        start: x,
        end: end,
        lines: 1
    }

};

class EnturMessageProviderFactory implements MessageProviderIcalAdapter<MessageProvider> {
    dataStore: PreemptiveCache;
    home: Location;

    static displayName: string;
    _config: config;

    constructor(dataStore : PreemptiveCache, config : config = {}) {
        this.dataStore = dataStore;
        this._config = config;
        this.home = settings.get("home");
    }

    //noinspection JSUnusedGlobalSymbols
    createMessageProvider(id : string, options: {location : Location}) : Entur {
        return new Entur(id, this.dataStore, this.home, options.location, this._config);
    }
}

module.exports = Entur;
module.exports.factory = EnturMessageProviderFactory;
EnturMessageProviderFactory.displayName = "Entur";
