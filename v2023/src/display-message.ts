import { LineType, MessageType } from "./MessageType";
import { program } from "commander";
import WebsocketDisplay from "./display/WebsocketDisplay";
import { rastrify } from "./rendering/Rastrifier";
import { AnnotatedBitmap } from "./bitmap/Bitmap";


type MessagePlayer = (message: MessageType) => Promise<void>;
const display = new WebsocketDisplay();

const defaultMessagePlayer: MessagePlayer = async (message: MessageType) => {
  return new Promise<void>((resolve) => {
    const rastrified: AnnotatedBitmap = rastrify(message.lines.map(line => line.text).join("/n"));
    display.clear();
    display.buffer.set(rastrified);
    display.output();
    // console.log(message.lines.map(line => line.text).join("\n"));
    setTimeout(resolve, message.durationMs);
  });
}

function createTextMessage(text: string, options: any): MessageType {
  const textLines = text.split("\\n");
  return {
    durationMs: options.duration,
    lines: textLines.slice(0, 2).map(textLine => {
      const line: LineType = {
        text: textLine,
        animation: {
          animationName: "NoAnimation",
          alignment: "left"
        }
      };
      return line;
    })
  };
}

program
  .version('0.0.1')
  .command("playlist")
  .argument('<file>', 'playlist file')
  .action(async (playlistFile: string, command: string) => {
    console.log("Playlist file: " + playlistFile);
  })
 program
  .command("output")
  .option('-d, --duration <duration>', 'duration of message', (str) => parseInt(str, 10), 5000)
  .argument('<message>', 'message to display')
  .action(async (text: string, options: any, command: string) => {
    const messagePlayer = defaultMessagePlayer;
    const message = createTextMessage(text, options);
    await messagePlayer(message);
  })
program
  .action(async () => {
    console.log("Default action");
    let str = '';
    process.stdin.setEncoding('utf8');
    for await (const chunk of process.stdin) str += chunk;
  })


program.parse(process.argv);
