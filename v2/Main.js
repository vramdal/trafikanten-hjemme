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

let framer = new Framer();

const messages : Array<Message> = [
    // framer.parse(SimpleTypes.FORMAT_SPECIFIER_START + "\x00\x0A\x02\x05" + SimpleTypes.FORMAT_SPECIFIER_END + "Laks!" + SimpleTypes.MESSAGE_PART_SEPARATOR + SimpleTypes.FORMAT_SPECIFIER_START + "\x10\x7F\x02\x05" + SimpleTypes.FORMAT_SPECIFIER_END + "Hei på deg!"),
    // framer.parse(SimpleTypes.FORMAT_SPECIFIER_START + "\x10\x7F\x02\x05" + SimpleTypes.FORMAT_SPECIFIER_END + "Hello, world!"),
    framer.parse(new Trafikanten().formatMessage(testdata))
];




let display : Display = new WebsocketDisplay();
let playlist : Playlist = new Playlist(display.eventEmitter, messages);
display.playlist = playlist;

display.play();

setTimeout(() => {
    "use strict";
    display.stop();
}, 300000);