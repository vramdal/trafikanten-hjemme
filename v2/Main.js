// @flow
const memwatch = require('memwatch-next');

memwatch.on('leak', (info) => {
    console.error('Memory leak detected:\n', info);
});

const Display = require("./display/Display");
// const PlaylistDisplay = require("./PlaylistDisplay.js");
const Framer = require("./Framer.js");
// const ConsoleDisplay = require("./display/ConsoleDisplay.js");
const WebsocketDisplay = require("./display/WebsocketDisplay.js");
//const SimpleTypes = require("./SimpleTypes.js");
// const Trafikanten = require("./Trafikanten.js");
//const testdata = require("./testdata/ensjø-departures-1.json");
// const Yr = require("./Yr.js");
const YrProviderFactory = require("./Yr.js").factory;
//const displayEventEmitter = require("./DisplayEventEmitter.js");
// const EventTypeNames = require("./SimpleTypes.js").EventTypeNames;
// const Entur = require("./Entur");
const EnturMessageProviderFactory = require("./Entur").factory;
let MessageProviderFactoryRegistry = require("./MessageProviderFactoryRegistry");

const FetchService = require("./fetch/PreemptiveCache.js");
let fetchService = new FetchService();
const IcsScheduleProvider = require("./schedule/IcsScheduleProvider");
const settings = require('./settings');

MessageProviderFactoryRegistry.register("entur", new EnturMessageProviderFactory(fetchService));
MessageProviderFactoryRegistry.register("yr", new YrProviderFactory(fetchService));


let framer = new Framer();

let display : Display = new WebsocketDisplay();


// let yr = new Yr("yr-1", fetchService);

// let entur = new Entur("entur-1", fetchService);

let calendarUrl = settings.get("calendarUrl");

let enturIcalProvider = new IcsScheduleProvider("ics-1", fetchService, calendarUrl, MessageProviderFactoryRegistry.get("entur"));

// let yrIcalProvider = new IcsScheduleProvider("ics-2", fetchService, calendarUrl, MessageProviderFactoryRegistry.get("yr"));

// let trafikanten1 = new Trafikanten("trafikanten-1", fetchService);
//let trafikanten2 = new Trafikanten("trafikanten-2", fetchService);

fetchService.start().then(() => {
    "use strict";
    setInterval(() =>
        enturIcalProvider.prepareNext().then(changeset => {
            console.log("changeset = ", changeset);
            enturIcalProvider.executeNext(changeset);
            console.log("messages", enturIcalProvider.getCurrentProviders().map(provider => {
                if (typeof provider.getMessage === "function") {
                    return provider.getMessage().map(part => part.text).join(" ");
                } else if (typeof provider.getPlaylist === "function") {
                    return provider.getPlaylist()
                } else {
                    return "Ingenting";
                }
            }));
        }), 5000);
/*
    let loop = function () {
        return Promise.all([
            enturIcalProvider.getCurrentProviders().map(provider => {
                if (typeof provider.getMessage === "function") {
                    return provider.getMessage();
                } else if (typeof provider.getPlaylist === "function") {
                    return provider.getPlaylist()
                }
            }),
            // trafikanten1.getMessage(),
            // entur.getMessage(),
            // yr.getPlaylist()
            //     ,
            //     Promise.resolve([{
            //         start: 127,
            //         end: 255,
            //         text: "           ▂ ▂ ▂ ▂ ▂ ▂                                                                             ▃ ▃ ▃ ▃ ▃ ▃▅ ▅ ▅ ▅ ▅ ▅█ █ █ █ █ ██ █ █ █ █ █",
            //         lines: 1,
            //         animation: {animationName: "NoAnimation", holdOnLine: 50, holdOnLastLine: 100, alignment: "center"},
            //         messageId: "staticMessage"
            //     }])
            ])
            .then(messageSpecs => {
/!*
                let tempMessageSpecs = [[Object.assign({},
                    { start: 0, end: 127, text: "aaa\nbbb", lines: 1},
                    { animation: {animationName : "VerticalScrollingAnimation", holdOnLine: 50, holdOnLastLine: 100, alignment: "center"}})]];

*!/
                const playlists = messageSpecs.map(framer.parse.bind(framer));
                let mergedPlaylist = [].concat.apply([], playlists);
                display.playlist = new PlaylistDisplay(display.eventEmitter, mergedPlaylist);
            })
            .catch(err => console.error(err));
    };

    display.eventEmitter.on(EventTypeNames.EVENT_PLAYLIST_EXHAUSTED, loop);
    loop().then(() => display.play());
 */

});


//noinspection JSUnusedLocalSymbols
/*yr.fetch().then(json => {
    const messages : Array<Message> = [
        // framer.parse(
        //     SimpleTypes.FORMAT_SPECIFIER_START + "\x00\x0A\x01\x02" + SimpleTypes.FORMAT_SPECIFIER_END + "Laks!" +
        //     SimpleTypes.FORMAT_SPECIFIER_START + "\x0A\x7F\x01\x02" + SimpleTypes.FORMAT_SPECIFIER_END + "Hei på deg!"),
        // framer.parse(yr.format(json)),
        // framer.parse([{text: "Værvarsel fra Yr, levert av NRK og Meteorologisk institutt", start: 0, end: 128, lines: 2, animation: {animationName: "VerticalScrollingAnimation", ticksPerPage: 100}}]
        framer.parse([{text: "Eld han tarv " +
            "som inn er komen "+
            "og um kne kulsar. "+
                "Til mat og klæde "+
            "den mann hev trong "+
            "som hev i fjell fari. ",
start: 0, end: 128, lines: 2, animation: {animationName: "VerticalScrollingAnimation", holdOnLine: 20}}]
        ),
        //framer.parse(SimpleTypes.FORMAT_SPECIFIER_START + "\x00\x7F\x01\x01\xFF\x01" + SimpleTypes.FORMAT_SPECIFIER_END + "░░ God natt! ░░"
        //framer.parse(new Trafikanten().formatMessage(testdata))



    ];




    display.playlist = new PlaylistDisplay(display.eventEmitter, messages);

    display.play();

}).catch(err => {
    "use strict";
    console.error(err);
});*/


/*
setTimeout(() => {
    "use strict";
    fetchService.stop();
    display.stop();
}, 300000);
*/
/*
 framer.parse([{text: "Eld han tarv " +
 "som inn er komen "+
 "og um kne kulsar. "+
 "Til mat og klæde "+
 "den mann hev trong "+
 "som hev i fjell fari. ",
 start: 0, end: 128, lines: 2, animation: {animationName: "VerticalScrollingAnimation", holdOnLine: 20}}]
 ),

 */
