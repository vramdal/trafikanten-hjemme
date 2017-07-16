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
        // framer.parse(
        //     SimpleTypes.FORMAT_SPECIFIER_START + "\x00\x0A\x01\x02" + SimpleTypes.FORMAT_SPECIFIER_END + "Laks!" +
        //     SimpleTypes.FORMAT_SPECIFIER_START + "\x0A\x7F\x01\x02" + SimpleTypes.FORMAT_SPECIFIER_END + "Hei på deg!"),
        // framer.parse(yr.format(json)),
        // framer.parse([{text: "Værvarsel fra Yr, levert av NRK og Meteorologisk institutt", start: 0, end: 128, lines: 2, animation: {animationName: "VerticalScrollingAnimation", ticksPerPage: 100}}]
        framer.parse([{text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse quis cursus enim. Donec quis tincidunt felis. Curabitur rhoncus rhoncus nulla, et vehicula mi interdum nec. Aenean pretium odio nec mollis ultricies. Sed in fermentum ex. Duis ut libero lacinia, congue velit nec, eleifend est. Suspendisse potenti. Phasellus ac neque quis orci ornare tincidunt id id enim. Vivamus et eleifend eros. Curabitur sit amet felis nulla. Phasellus tellus odio, accumsan efficitur tortor bibendum, tristique dapibus lectus. Etiam quis aliquam lacus. Cras a ipsum non turpis tempus commodo. Aliquam eget tempus elit. Quisque vitae fringilla ligula. " +

"Quisque vel dolor leo. Pellentesque vitae convallis sapien. Vivamus fermentum mi ligula, quis efficitur orci consequat sit amet. Maecenas eget eros semper, interdum lacus vitae, elementum ex. Pellentesque quis iaculis sem. In fringilla nibh in augue elementum faucibus. Praesent venenatis tellus vitae orci ornare accumsan. Quisque volutpat semper leo at bibendum. Proin rutrum enim non sagittis ultrices. Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Donec dapibus gravida enim, sed lacinia lacus. Cras arcu nisi, dignissim pellentesque erat vel, tincidunt tincidunt tellus. Fusce ut egestas tortor. " +

"Phasellus rutrum pretium hendrerit. Integer a felis vitae sem ornare aliquet ac ac est. Nunc bibendum luctus dignissim. Curabitur ut accumsan dui, dapibus finibus ipsum. Nullam a volutpat felis. Mauris molestie ex vitae enim pellentesque, non blandit nibh tincidunt. Nunc eget justo elit. Curabitur euismod metus vitae elit varius, fermentum vehicula libero aliquam. Donec pellentesque vitae lacus eu dictum. Nullam vitae finibus neque. Vivamus suscipit, eros sed tempus posuere, tellus ipsum laoreet sem, vitae laoreet nisi lacus vitae tortor. Sed faucibus molestie lorem nec euismod. Proin sit amet libero at augue congue egestas. Suspendisse mollis dui eget lobortis interdum. " +

"Sed malesuada ut lectus pretium viverra. Ut ornare est sed nisi tristique ultrices. Praesent ut sapien posuere, molestie magna gravida, imperdiet dui. Duis erat ligula, elementum ut hendrerit sed, iaculis quis quam. Donec vehicula rhoncus velit, et finibus justo ultrices at. Cras metus tellus, elementum molestie lobortis ac, hendrerit id orci. Curabitur quis augue ut turpis venenatis euismod. Phasellus imperdiet porta consectetur. Praesent molestie ex ornare, imperdiet enim ac, dictum purus. Pellentesque vitae porta erat. Duis feugiat tempor est vitae mollis. Donec bibendum nisl nec scelerisque luctus. Integer a augue non tellus tincidunt ultricies. Nam viverra sem ipsum, at lobortis eros ultrices quis. Donec luctus varius ipsum, et porta arcu vulputate vel. "+

"Praesent euismod a eros a convallis. Vestibulum facilisis et diam nec bibendum. Praesent mi metus, eleifend at metus ac, malesuada condimentum metus. Aliquam ultricies accumsan erat, ac pellentesque massa venenatis eu. Mauris tincidunt vel nunc non fringilla. Quisque commodo lorem a tincidunt sollicitudin. Vivamus at dui vitae nulla tempus dignissim vitae at quam. Sed et mi ultrices, pretium justo nec, gravida leo. Ut molestie, nisl non varius luctus, justo eros pretium ex, eu accumsan risus orci sed metus. Duis at neque in ligula euismod luctus. Nullam porttitor lectus ac tellus laoreet, sagittis bibendum tortor euismod. Aliquam commodo tempor mauris, vitae eleifend eros vulputate iaculis. Vivamus iaculis lorem vitae tellus viverra, eget lacinia enim porta. Sed a varius mauris. Integer ex purus, feugiat at pulvinar eget, malesuada eu urna.", start: 0, end: 128, lines: 2, animation: {animationName: "VerticalScrollingAnimation", ticksPerPage: 100}}]
        ),
        //framer.parse(SimpleTypes.FORMAT_SPECIFIER_START + "\x00\x7F\x01\x01\xFF\x01" + SimpleTypes.FORMAT_SPECIFIER_END + "░░ God natt! ░░"
        //framer.parse(new Trafikanten().formatMessage(testdata))



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