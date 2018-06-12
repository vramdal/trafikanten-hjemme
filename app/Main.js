// @flow
const memwatch = require('memwatch-next');

memwatch.on('leak', (info) => {
    console.error('Memory leak detected:\n', info);
});

const Display = require("./display/Display");
const PlaylistDisplay = require("./rendering/PlaylistDisplay.js");
const Framer = require("./rendering/Framer.js");
const WebsocketDisplay = require("./display/WebsocketDisplay.js");
const EventTypeNames = require("./types/SimpleTypes.js").EventTypeNames;
const createHttpUiServer = require("./http-ui/ExpressServer").createHttpUiServer;

const FetchService = require("./fetch/PreemptiveCache.js");
let fetchService = new FetchService();
const ScheduleProviderPrioritySetup = require("./schedule/ScheduleProviderPrioritySetup");
const settings = require('./settings');
const flatten = require("lodash").flatten;

let framer = new Framer();
let DisplayPrioritizer = require("./schedule/DisplayPrioritizer");
let uiServer = createHttpUiServer(6060);
let display : Display = new WebsocketDisplay(6061);

fetchService.start().then(() => {
    "use strict";
    let calendarMap = {};
    let calendarLayout = [settings.get("calendars").map(calendar => ({colSpan: 1, calendarUrl: calendar.url}))];
    settings.get("calendars").forEach(calendar => calendarMap[calendar.url] = {url: calendar.url, messageProvider: calendar.messageProvider, name: calendar.name});
    const displayPrioritizer = new DisplayPrioritizer(new ScheduleProviderPrioritySetup(calendarLayout, calendarMap), fetchService);
    displayPrioritizer.start();
    let loop = function() {
        const playlist = displayPrioritizer.getPlaylist();
        const messageSpecs = [].concat(playlist);
        const messages = flatten(messageSpecs.map(framer.parse.bind(framer)));
        display.playlist = new PlaylistDisplay(display.eventEmitter, messages);
        return Promise.all([(resolve) => {window.setTimeout(resolve, 3000)}]);
    };
    display.eventEmitter.on(EventTypeNames.EVENT_PLAYLIST_EXHAUSTED, loop);
    loop().then(() => display.play()).catch(err => {console.error(err); display.play()});
});