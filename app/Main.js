// @flow
const PlaylistDisplay = require("./rendering/PlaylistDisplay.js");
const Framer = require("./rendering/Framer.js");
const EventTypeNames = require("./types/SimpleTypes.js").EventTypeNames;
const createHttpUiServer = require("./http-ui/ExpressServer").createHttpUiServer;

const FetchService = require("./fetch/PreemptiveCache.js");
let fetchService = new FetchService();
const ScheduleProviderPrioritySetup = require("./schedule/ScheduleProviderPrioritySetup");
const settings = require('./settings');
const flatten = require("lodash").flatten;

const program = require('commander');
const version = require('./package.json').version;

program.version(version)
    .option('-s, --websocket [port]', 'Output to websocket [port]. Defaults to 6061.', parseInt)
    .option('-N, --nogpio', 'Do not output to GPIO display.')
    .option('-p, --uiport [port]', 'Start admin UI on [port]. Defaults to 6060.', parseInt, 6060)
    .option('-t, --timingfactor <factor>', 'Multiply timeouts by [factor]. Defaults to 1.0', parseFloat, 1.0)
    .option('-m --memwatch', 'Watch memory for leaks')
    .parse(process.argv)
;

if (program.memwatch) {
    const memwatch = require('memwatch-next');

    memwatch.on('leak', (info) => {
        console.error('Memory leak detected:\n', info);
    });
}

const timingfactor = program.timingfactor;

let framer = new Framer();
let DisplayPrioritizer = require("./schedule/DisplayPrioritizer");
const uiPort = program.uiport;
console.log("Starting admin UI on port " + uiPort);
let uiServer = createHttpUiServer(uiPort, process.env.NODE_ENV === 'development', {fetchService: fetchService.getState.bind(fetchService)});
let display;
if (program.websocket) {
    console.log('Outputting to WebSocket display on port ' + program.websocket);
    display = new (require("./display/WebsocketDisplay.js"))(program.websocket);
} else if (!program.nogpio) {
    console.log('Outputting to GPIO display');
    display = new (require("./display/GPIOPiDisplay.js"));
}
console.log("Timing factor", timingfactor);
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
        display.playlist = new PlaylistDisplay(display.eventEmitter, messages, timingfactor);
        return Promise.all([(resolve) => {window.setTimeout(resolve, 3000)}]);
    };
    display.eventEmitter.on(EventTypeNames.EVENT_PLAYLIST_EXHAUSTED, loop);
    loop().then(() => display.play()).catch(err => {console.error(err); display.play()});
});