// @flow

export type Char = string;

export type Byte = number;
//noinspection JSUnusedGlobalSymbols
const NEWLINE : Char = '\n';
//noinspection JSUnusedGlobalSymbols
const TAB : Char = '\t';
//noinspection JSUnusedGlobalSymbols
//const MESSAGE_PART_SEPARATOR : Char = "\x1D";
//noinspection JSUnusedGlobalSymbols
const FORMAT_SPECIFIER_START = "\x0F";
//noinspection JSUnusedGlobalSymbols
const FORMAT_SPECIFIER_END = "\x0E";

const EventTypeNames = {
    EVENT_BITMAP_UPDATED: "EVENT_BITMAP_UPDATED",
    EVENT_BITMAP_CLEAR: "EVENT_BITMAP_CLEAR",
    EVENT_PLAYLIST_EXHAUSTED: "EVENT_PLAYLIST_EXHAUSTED"
};

module.exports = {NEWLINE, TAB, /*MESSAGE_PART_SEPARATOR, */EventTypeNames, FORMAT_SPECIFIER_START, FORMAT_SPECIFIER_END};

export type OptionalArrayOrSingleElement<V> = (V | Array<V>) | undefined;


