export type Alignments = 'left' | 'center' | 'right';
import { NoAnimationType, ScrollingType } from "./animations/Types";

// export type NoAnimationType = {animationName : 'NoAnimation', alignment : Alignments}

// export type ScrollingType = {animationName : 'ScrollingAnimation' }

export type AnimationType = NoAnimationType |  ScrollingType


export type LineType = {
  text: string,
  animation: AnimationType
}

export type MessageType = {
  durationMs: number,
  lines: Array<LineType>
}

class _PlaylistSpec extends Array<MessageType> { playlistId : string }

export type PlaylistType = _PlaylistSpec;
