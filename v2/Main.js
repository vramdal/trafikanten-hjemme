// @flow
const Display = require("./display/Display");
const Playlist = require("./Playlist.js");
const Framer = require("./Framer.js");
const ConsoleDisplay = require("./display/ConsoleDisplay.js");
const WebsocketDisplay = require("./display/WebsocketDisplay.js");
//const SimpleTypes = require("./SimpleTypes.js");
const Trafikanten = require("./Trafikanten.js");
const testdata = require("./testdata/ensjø-departures-1.json");
const Yr = require("./Yr.js");

const FetchService = require("./fetch/PreemptiveCache.js");

let framer = new Framer();

let display : Display = new WebsocketDisplay();

let yr = new Yr();

let fetchService = new FetchService();

let trafikanten1 = new Trafikanten("1", fetchService);
let trafikanten2 = new Trafikanten("2", fetchService);

fetchService.start();

Promise.all([trafikanten1.getContent(), trafikanten2.getContent()])
    .then(messageSpecs => {
        const messages = messageSpecs.map(framer.parse);
        display.playlist = new Playlist(display.eventEmitter, messages);
        display.play();
    })
    .catch(err => console.error(err));

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




    display.playlist = new Playlist(display.eventEmitter, messages);

    display.play();

}).catch(err => {
    "use strict";
    console.error(err);
});*/


setTimeout(() => {
    "use strict";
    fetchService.stop();
    display.stop();
}, 300000);