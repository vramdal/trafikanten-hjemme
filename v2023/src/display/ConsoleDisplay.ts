import Display from "./Display";
import type {DisplayInterface} from "./DisplayInterface";


import * as BitmapUtil from "../bitmap/BitmapUtil";

class ConsoleDisplay extends Display implements DisplayInterface {

    constructor() {
        super();
    }

    //noinspection JSMethodCanBeStatic
    output() {
        BitmapUtil.bitmapTo8Lines(super.buffer.slice(0, 128));
        BitmapUtil.bitmapTo8Lines(super.buffer.slice(128));
    }
}

export default ConsoleDisplay;
