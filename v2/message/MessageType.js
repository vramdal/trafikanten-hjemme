// @flow

import type {NoAnimationType, PagingAnimationType, ScrollingType} from "../animations/Types";
export type AnimationType = NoAnimationType | PagingAnimationType | ScrollingType

type FrameSpecType = {
    text: string,
    start : number,
    end : number,
    lines : number,
}

export type MessagePartType = FrameSpecType & {animation: AnimationType}

export type MessageType = Array<MessagePartType>;
