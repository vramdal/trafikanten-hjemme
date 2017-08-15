// @flow
const memwatch = require('memwatch-next');

memwatch.on('leak', (info) => {
    console.error('Memory leak detected:\n', info);
});

const Display = require("./display/Display");
const Playlist = require("./Playlist.js");
const Framer = require("./Framer.js");
const ConsoleDisplay = require("./display/ConsoleDisplay.js");
const WebsocketDisplay = require("./display/WebsocketDisplay.js");
//const SimpleTypes = require("./SimpleTypes.js");
const Trafikanten = require("./Trafikanten.js");
//const testdata = require("./testdata/ensjø-departures-1.json");
const Yr = require("./Yr.js");
//const displayEventEmitter = require("./DisplayEventEmitter.js");
const EventTypeNames = require("./SimpleTypes.js").EventTypeNames;



const FetchService = require("./fetch/PreemptiveCache.js");

let framer = new Framer();

let display : Display = new WebsocketDisplay();


let fetchService = new FetchService();

let yr = new Yr("yr-1", fetchService);

let trafikanten1 = new Trafikanten("trafikanten-1", fetchService);
let trafikanten2 = new Trafikanten("trafikanten-2", fetchService);

fetchService.start().then(() => {
    "use strict";
    let loop = function () {
        return Promise.all([/*trafikanten1.getContent(), */yr.getContent()])
            .then(messageSpecs => {
/*
                let tempMessageSpecs = [[Object.assign({},
                    { start: 0, end: 127, text: "aaa\nbbb", lines: 1},
                    { animation: {animationName : "VerticalScrollingAnimation", holdOnLine: 50, holdOnLastLine: 100, alignment: "center"}})]];

*/
                const messages = messageSpecs.map(framer.parse);
                display.playlist = new Playlist(display.eventEmitter, messages);
            })
            .catch(err => console.error(err));
    };

    display.eventEmitter.on(EventTypeNames.EVENT_PLAYLIST_EXHAUSTED, loop);
    loop().then(() => display.play());

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




    display.playlist = new Playlist(display.eventEmitter, messages);

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
