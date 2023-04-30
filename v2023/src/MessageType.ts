export type Alignments = 'left' | 'center' | 'right';

export type NoAnimationType = {animationName : 'NoAnimation', alignment : Alignments}

export type ScrollingType = {animationName : 'ScrollingAnimation' }

export type AnimationType = NoAnimationType |  ScrollingType


export type LineType = {
  text: string,
  animation: AnimationType
}

export type MessageType = {
  durationMs: number,
  lines: Array<LineType>
}
