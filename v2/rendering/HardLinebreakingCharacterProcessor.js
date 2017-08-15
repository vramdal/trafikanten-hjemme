// @flow

const LinebreakAnnotation = require("./LinebreakAnnotation.js");

import type {Char} from "../SimpleTypes";
import type {AnnotatedBitmap} from "../Bitmap";
import type {CharacterProcessor} from "./CharacterProcessor";

type LinebreakAtPosition = {chStart : number, chEnd: number, xStart : number, xEnd: number};

class HardLinebreakingCharacterProcessor implements CharacterProcessor {

    characterMap : Array<{chIdx: number}>;
    linebreaks: Array<LinebreakAtPosition>;

    constructor() {
        this.characterMap = [];
        this.linebreaks = [];
    }

    processCharacter(text : string, chIdx : number) : number {
        "use strict";
        let restStr: Char = text.substring(chIdx);
        let match = restStr.match(/^(\n+).+/);
        if (match) {
            this.characterMap.push({chIdx, str: match[1]});
            return 0;
        }
        return 0;
    }

    mapCharacterToPosition(chIdx : number, x : number) {
        this.linebreaks = this.linebreaks.concat(this.characterMap.filter(ch => ch.chIdx === chIdx)
            .map(ch => ({chStart : ch.chIdx, chEnd : chIdx + 1, xStart : x, xEnd : x})));
    }

    //noinspection JSUnusedGlobalSymbols
    place(bitmap: AnnotatedBitmap): void {
        for (let linebreakAtPosition of this.linebreaks) {
            bitmap.annotations.push(new LinebreakAnnotation(linebreakAtPosition.xStart, linebreakAtPosition.xEnd, 'Hard'));
        }
    }

}

module.exports = HardLinebreakingCharacterProcessor;