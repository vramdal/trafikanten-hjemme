// @flow

const LinebreakAnnotation = require("./LinebreakAnnotation.js");

import type {Char} from "../SimpleTypes";
import type {AnnotatedBitmap} from "../Bitmap";
import type {CharacterProcessor} from "./CharacterProcessor";

type SoftLinebreakAtPosition = {chStart : number, chEnd: number, xStart : number, xEnd: number};

class LinebreakingCharacterProcessor implements CharacterProcessor {

    characterMap : Array<{chIdx: number, str: string}>;
    softLinebreaksAtPositions: Array<SoftLinebreakAtPosition>;
    skipUntilCharacterWhenProcessing: number;
    skipUntilCharacterWhenMapping: number;
    softLinebreakUnderCreation: ?{chStart : number, chEnd: number, xStart: number};

    constructor() {
        this.characterMap = [];
        this.softLinebreaksAtPositions = [];
        this.skipUntilCharacterWhenProcessing = 0;
        this.skipUntilCharacterWhenMapping = 0;
        this.softLinebreakUnderCreation = undefined;
    }

    processCharacter(text : string, chIdx : number) : number {
        "use strict";
        if (chIdx < this.skipUntilCharacterWhenProcessing) {
            return 0;
        }
        let restStr: Char = text.substring(chIdx);
        let match = restStr.match(/^(\s+).+/);
        if (match) {
            const linebreaker = match[1];
            this.characterMap.push({chIdx, str: linebreaker});
            this.skipUntilCharacterWhenProcessing = chIdx + linebreaker.length;
        }
        return 0;
    }

    mapCharacterToPosition(chIdx : number, x : number) {
        if (this.softLinebreakUnderCreation && this.softLinebreakUnderCreation.chEnd <= chIdx) {
            this.softLinebreaksAtPositions.push({
                chStart: this.softLinebreakUnderCreation.chStart,
                chEnd: this.softLinebreakUnderCreation.chEnd,
                xStart: this.softLinebreakUnderCreation.xStart,
                xEnd: x
            });
            this.softLinebreakUnderCreation = undefined;
        } else if (!this.softLinebreakUnderCreation) {
            let characterAtChIdx = this.characterMap.find(characterMapElement => characterMapElement.chIdx === chIdx);
            if (characterAtChIdx) {
                this.softLinebreakUnderCreation = {
                    chStart: chIdx,
                    chEnd: chIdx + characterAtChIdx.str.length,
                    xStart: x
                };
            }
        }
    }

    //noinspection JSUnusedGlobalSymbols
    place(bitmap: AnnotatedBitmap): void {
        for (let softLinebreakAtPosition of this.softLinebreaksAtPositions) {
            bitmap.annotations.push(new LinebreakAnnotation(softLinebreakAtPosition.xStart, softLinebreakAtPosition.xEnd));
        }
    }

}

module.exports = LinebreakingCharacterProcessor;