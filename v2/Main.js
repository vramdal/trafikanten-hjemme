// @flow
const Display = require("./Display");
const Message = require("./Message.js");
const Playlist = require("./Playlist.js");
const Framer = require("./Framer.js");
const SimpleTypes = require("./SimpleTypes.js");

let framer = new Framer();

const messages : Array<Message> = [
    framer.parse(SimpleTypes.FORMAT_SPECIFIER_START + "\x00\x0A\x02\x05" + SimpleTypes.FORMAT_SPECIFIER_END + "Laks!" + SimpleTypes.MESSAGE_PART_SEPARATOR + SimpleTypes.FORMAT_SPECIFIER_START + "\x10\x7F\x02\x05" + SimpleTypes.FORMAT_SPECIFIER_END + "Hei på deg!"),
    // framer.parse(SimpleTypes.FORMAT_SPECIFIER_START + "\x10\x7F\x02\x05" + SimpleTypes.FORMAT_SPECIFIER_END + "Hello, world!"),
];


let display : Display = new Display();
let playlist : Playlist = new Playlist(display.eventEmitter, messages);
display.playlist = playlist;

display.play();

setTimeout(() => {
    "use strict";
    display.stop();
}, 300000);