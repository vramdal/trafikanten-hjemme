// @flow

const LinebreakAnnotation = require("./LinebreakAnnotation.js");

import type {Char} from "../types/SimpleTypes";
import type {AnnotatedBitmap} from "../bitmap/Bitmap";
import type {CharacterProcessor} from "./CharacterProcessor";

type SoftLinebreakAtPosition = {chStart : number, chEnd: number, xStart : number, xEnd: number};

class SoftLinebreakingCharacterProcessor implements CharacterProcessor {

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

    processCharacter(text : string, chIdx : number) : Array<any> {
        "use strict";
        if (chIdx < this.skipUntilCharacterWhenProcessing) {
            return [];
        }
        let restStr: Char = text.substring(chIdx);
        let match = restStr.match(/^([^\S\n]+).+/);
        if (match) {
            const linebreaker = match[1];
            this.characterMap.push({chIdx, str: linebreaker});
            this.skipUntilCharacterWhenProcessing = chIdx + linebreaker.length;
        }
        return [];
    }

    mapCharacterToPosition(chIdx : number, x : number) : number {
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
        return 0;
    }

    //noinspection JSUnusedGlobalSymbols
    place(bitmap: AnnotatedBitmap): void {
        for (let softLinebreakAtPosition of this.softLinebreaksAtPositions) {
            bitmap.annotations.push(new LinebreakAnnotation(softLinebreakAtPosition.xStart, softLinebreakAtPosition.xEnd, 'Soft'));
        }
    }

}

module.exports = SoftLinebreakingCharacterProcessor;