// @flow
const Display = require("./Display");
let display : Display = new Display();

display.play();

setTimeout(() => {
    "use strict";
    display.stop();
}, 30000);