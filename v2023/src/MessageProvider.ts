import { MessageType } from "./MessageType";

interface MessageProvider {
  getMessage(): Promise<MessageType>
}


export const createTextMessage = (line1: string, line2: string): MessageType => {
  return {
    durationMs: 5000,
    lines: [{
      text: line1,
      animation: {
        animationName: "NoAnimation",
        alignment: "left"
      }
    }, {
      text: line2,
      animation: {
        animationName: "NoAnimation",
        alignment: "left"
      }
    }]
  }
}
