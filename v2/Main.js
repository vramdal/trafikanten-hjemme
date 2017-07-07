// @flow
const Display = require("./display/Display");
const Message = require("./Message.js");
const Playlist = require("./Playlist.js");
const Framer = require("./Framer.js");
const ConsoleDisplay = require("./display/ConsoleDisplay.js");
const WebsocketDisplay = require("./display/WebsocketDisplay.js");
//const SimpleTypes = require("./SimpleTypes.js");
const Trafikanten = require("./Trafikanten.js");
const testdata = require("./testdata/ensjø-departures.json");
const Yr = require("./Yr.js");

let framer = new Framer();

let display : Display = new WebsocketDisplay();

let yr = new Yr();

//noinspection JSUnusedLocalSymbols
yr.fetch().then(json => {
    const messages : Array<Message> = [
/*
        framer.parse(
            SimpleTypes.FORMAT_SPECIFIER_START + "\x00\x0A\x01\x02" + SimpleTypes.FORMAT_SPECIFIER_END + "Laks!" +
            SimpleTypes.FORMAT_SPECIFIER_START + "\x0A\x7F\x01\x02" + SimpleTypes.FORMAT_SPECIFIER_END + "Hei på deg!"),
        framer.parse(yr.format(json)),
        framer.parse(
            SimpleTypes.FORMAT_SPECIFIER_START + "\x00\x7F\x02\x03\x1A" + SimpleTypes.FORMAT_SPECIFIER_END + "Værvarsel fra Yr, levert av NRK og Meteorologisk institutt"
        ),
*/
        //framer.parse(SimpleTypes.FORMAT_SPECIFIER_START + "\x00\x7F\x01\x01\xFF\x01" + SimpleTypes.FORMAT_SPECIFIER_END + "░░ God natt! ░░"
        framer.parse(new Trafikanten().formatMessage(testdata))



    ];




    display.playlist = new Playlist(display.eventEmitter, messages);

    display.play();

}).catch(err => {
    "use strict";
    console.error(err);
});


setTimeout(() => {
    "use strict";
    display.stop();
}, 300000);