import type {NoAnimationType, PagingAnimationType, ScrollingType, VerticalScrollingType} from "../animations/Types";
export type AnimationType = NoAnimationType | PagingAnimationType | ScrollingType/* | VerticalScrollingType*/

type FrameSpecType = {
    text: string,
    start : number,
    end : number,
    lines : number
}

export type MessagePartType = FrameSpecType & {animation: AnimationType}

// https://github.com/facebook/flow/issues/631

export type MessageType = Array<MessagePartType> & { messageId: string };

class _PlaylistSpec extends Array<MessageType> { playlistId : string }

export type PlaylistType = {} & _PlaylistSpec;
