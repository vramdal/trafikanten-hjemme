// @flow

export type Alignments = 'left' | 'center' | 'right';

export type NoAnimationType = {animationName : 'NoAnimation', timeoutTicks : number, alignment : Alignments}

export type PagingAnimationType = {animationName : 'PagingAnimation', ticksPerPage : number}

export type ScrollingType = {animationName : 'ScrollingAnimation' }

export type VerticalScrollingType = {animationName : "VerticalScrollingAnimation", holdOnLine : number}

