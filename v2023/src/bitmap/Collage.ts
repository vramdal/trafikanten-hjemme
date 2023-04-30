import type { Bitmap } from "./Bitmap";
import type { Layout } from "./Frame";
import { Frame } from "./Frame.js";

class Collage {
  _layout: Layout;

  constructor(layout: Layout) {
    this._layout = layout;
  }

  pasteTo(target: Bitmap) {
    this._layout.forEach((frame: Frame, idx: number) => {
      try {
        for (let lineIdx = 0; lineIdx < frame.lines; lineIdx++) {
          target.set(frame.getBitmap(lineIdx), frame.x + lineIdx * frame.width);
        }
      } catch (e) {
        throw new Error(`Attempting to paste a ${frame.width}-width bitmap on position ${frame.x} on a ${target.length}-width target in frame ${idx}\n${e.message}`);
      }
    });
  }
}

export default Collage;
