import { LineType, MessageType as MessageSpec } from "./MessageType";
import { program } from "commander";
import WebsocketDisplay from "./display/WebsocketDisplay";
import { rastrify } from "./rendering/Rastrifier";
import { AnnotatedBitmap } from "./bitmap/Bitmap";
import { readFileSync } from "fs";
import PlaylistDisplay from "./rendering/PlaylistDisplay";
import Message from "./types/Message";
import { PlaylistType, MessageType, MessagePartType } from "./message/MessageType";
import Framer from "./rendering/Framer";

type MessagePlayer = (message: MessageSpec) => Promise<void>;
const display = new WebsocketDisplay();

const defaultMessagePlayer: MessagePlayer = async (message: MessageSpec) => {
  const messageParts : Array<MessagePartType> = message.lines.map((line: LineType, idx: number) => ({
    text: line.text,
    start: (128 * idx),
    end: 128 + (128 * idx),
    lines: 1,
    animation: {
      animationName: "NoAnimation",
      alignment: "left",
      timeoutTicks: message.durationMs
    }
  }));
  const framer = new Framer();
  // framer.createMessage()
  let framedMessage : MessageType = Object.assign(messageParts, {messageId: "test"});
  const playlist: PlaylistType = Object.assign([framedMessage], { playlistId: "test" });
  const messageSpecs = [].concat(playlist);
  const messages : Array<Message> = playlist.map(playlistMessage => framer.parse(playlistMessage)).flat();
  return new Promise<void>((resolve) => {
    display.playlist = new PlaylistDisplay(display, messages);
    display.clear();
    // display.buffer.set(rastrified);
    display.play();
    // display.output();
    // console.log(message.lines.map(line => line.text).join("\n"));
    setTimeout(resolve, message.durationMs);
  });
}

function createTextMessage(text: string, options: any): MessageSpec {
  const textLines = text.split(/[\n\r]/);
  return {
    durationMs: options.duration,
    lines: textLines.slice(0, 2).map(textLine => {
      const line: LineType = {
        text: textLine,
        animation: {
          animationName: "NoAnimation",
          alignment: "left",
          timeoutTicks: options.duration
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

async function playMessage(text: string, options: any) {
  const messagePlayer = defaultMessagePlayer;
  const message = createTextMessage(text.trim(), options);
  await messagePlayer(message);
  await display.close();
}

program
  .command("output")
  .option('-d, --duration <duration>', 'duration of message', (str) => parseInt(str, 10), 5000)
  .argument('<message>', 'message to display')
  .action(async (text: string, options: any, command: string) => {
    await playMessage(text, options);
  })
program
  .command("output-file")
  .option('-d, --duration <duration>', 'duration of message', (str) => parseInt(str, 10), 5000)
  .argument('<file>', 'file to display')
  .action(async (file: string, options: any, command: string) => {
    const fileContents = readFileSync(file, { encoding: 'utf8', flag: 'r' });
    await playMessage(fileContents, options);
  });
program
  .action(async () => {
    console.log("Default action");
    let str = '';
    process.stdin.setEncoding('utf8');
    for await (const chunk of process.stdin) str += chunk;
    console.log(`Outputting: '${str}'`)
    await playMessage(str.trim(), { duration: 1000 });
  })


program.parse(process.argv);
