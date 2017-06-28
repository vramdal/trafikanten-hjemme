// @flow
//export type EventTypes = $Keys<typeof EventTypeNames>;

export type Char = string;
//noinspection JSUnusedGlobalSymbols
const NEWLINE : Char = '\n';
//noinspection JSUnusedGlobalSymbols
const TAB : Char = '\t';
//noinspection JSUnusedGlobalSymbols
const MESSAGE_PART_SEPARATOR : Char = '\0x1D';


const EventTypeNames = {
    EVENT_BITMAP_UPDATED: "EVENT_BITMAP_UPDATED"
};

module.exports = {NEWLINE, TAB, MESSAGE_PART_SEPARATOR, EventTypeNames};


