/**
 * A tuple consisting of the byte idx and a bit idx within the byte
 */
export type BytePosition = {x: number, y: number};


export type WedgeOrientation = "Horizontal";

/**
 * A wedge is a non-writeable area of the physical layout. A tuple of position and width/height
 */
export type DeadZone = [number, number];