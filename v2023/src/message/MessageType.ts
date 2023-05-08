import type {NoAnimationType, PagingAnimationType, ScrollingType, VerticalScrollingType} from "../animations/Types";
export type AnimationType = NoAnimationType | PagingAnimationType | ScrollingType/* | VerticalScrollingType*/

type FrameSpecType = {
    text: string,
    start : number,
    end : number,
}

export type MessagePartType = FrameSpecType & {animation: AnimationType}

// https://github.com/facebook/flow/issues/631

export type MessageType = Array<MessagePartType> & { messageId: string };

export type PlaylistType = Array<MessageType> & { playlistId : string };
