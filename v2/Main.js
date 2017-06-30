// @flow
const Display = require("./Display");
const Message = require("./Message.js");
const Playlist = require("./Playlist.js");

const messages : Array<Message> = [new Message("Hei på deg!"), new Message("Hello, world!")];


let display : Display = new Display();
let playlist : Playlist = new Playlist(display.eventEmitter, messages);
display.playlist = playlist;

display.play();

setTimeout(() => {
    "use strict";
    display.stop();
}, 300000);