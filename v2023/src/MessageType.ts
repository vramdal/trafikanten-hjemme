import { MessagePartType } from "./message/MessageType";

export type Alignments = 'left' | 'center' | 'right';
import { NoAnimationType, ScrollingType } from "./animations/Types";

// export type NoAnimationType = {animationName : 'NoAnimation', alignment : Alignments}

// export type ScrollingType = {animationName : 'ScrollingAnimation' }

export type AnimationType = NoAnimationType |  ScrollingType


export type LineType = {
  text: string,
  animation: AnimationType
}

export type MessageSpec = Array<MessagePartType>;

class _PlaylistSpec extends Array<MessageSpec> { playlistId : string }

export type PlaylistType = _PlaylistSpec;
