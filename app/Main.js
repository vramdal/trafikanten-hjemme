// @flow
const Display = require("./display/Display");
const PlaylistDisplay = require("./rendering/PlaylistDisplay.js");
const Framer = require("./rendering/Framer.js");
const EventTypeNames = require("./types/SimpleTypes.js").EventTypeNames;
const createHttpUiServer = require("./http-ui/ExpressServer").createHttpUiServer;

const FetchService = require("./fetch/PreemptiveCache.js");
let fetchService = new FetchService();
const ScheduleProviderPrioritySetup = require("./schedule/ScheduleProviderPrioritySetup");
const settings = require('./settings');
const flatten = require("lodash").flatten;

let framer = new Framer();
let DisplayPrioritizer = require("./schedule/DisplayPrioritizer");
let uiServer = createHttpUiServer(6060, process.env.NODE_ENV === 'development');
let display;
if (process.argv[2] === "ws") {
    console.log('Outputting to WebSocket display');
    display = new (require("./display/WebsocketDisplay.js"))(6061);
} else {
    console.log('Outputting to GPIO display');
    display = new (require("./display/GPIOPiDisplay.js"));
}
// const display = require("./display/GPIOPiDisplay.js");
// let display : Display = new WebsocketDisplay(6061);

fetchService.start().then(() => {
    "use strict";
    let calendarMap = {};
    let calendarLayout = [settings.get("calendars").filter(calendar => calendar.enabled !== false).map(calendar => ({colSpan: 1, calendarUrl: calendar.url}))];
    settings.get("calendars").filter(calendar => calendar.enabled !== false).forEach(calendar => calendarMap[calendar.url] = calendar);
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