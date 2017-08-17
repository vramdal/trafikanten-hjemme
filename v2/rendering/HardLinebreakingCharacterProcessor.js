// @flow

const LinebreakAnnotation = require("./LinebreakAnnotation.js");

import type {Char} from "../SimpleTypes";
import type {AnnotatedBitmap} from "../Bitmap";
import type {CharacterProcessor} from "./CharacterProcessor";

type LinebreakAtPosition = {chStart : number, chEnd: number, xStart : number, xEnd: number};

class HardLinebreakingCharacterProcessor implements CharacterProcessor {

    characterMap : Array<?{chIdx: number}>;
    linebreaks: Array<LinebreakAtPosition>;

    constructor() {
        this.characterMap = [];
        this.linebreaks = [];
    }

    processCharacter(text : string, chIdx : number) : Array<any> {
        "use strict";
        let restStr: Char = text.substring(chIdx);
        let match = restStr.match(/^(\n+).+/);
        if (match) {
            this.characterMap.push({chIdx, str: match[1]});
            return [null];
        }
        return [];
    }

    mapCharacterToPosition(chIdx : number, x : number) : number {
        const linebreak = this.characterMap.find(ch => ch && ch.chIdx === chIdx);
        if (linebreak) {
            this.linebreaks.push({chStart : linebreak.chIdx, chEnd : chIdx + 1, xStart : x, xEnd : x});
        }
        return 0;
    }

    //noinspection JSUnusedGlobalSymbols
    place(bitmap: AnnotatedBitmap): void {
        for (let linebreakAtPosition of this.linebreaks) {
            bitmap.annotations.push(new LinebreakAnnotation(linebreakAtPosition.xStart, linebreakAtPosition.xEnd, 'Hard'));
        }
    }

}

module.exports = HardLinebreakingCharacterProcessor;