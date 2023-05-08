import { MessageSpec } from "./MessageType";
import { program } from "commander";
import WebsocketDisplay from "./display/WebsocketDisplay";
import { readFileSync } from "fs";
import PlaylistDisplay from "./rendering/PlaylistDisplay";
import Message from "./types/Message";
import { MessagePartType, MessageType, PlaylistType } from "./message/MessageType";
import Framer from "./rendering/Framer";

type MessagePlayer = (message: MessageSpec) => Promise<void>;
const display = new WebsocketDisplay();
// const display = new ConsoleDisplay();

const defaultMessage: Array<MessagePartType> = [{
  start: 0,
  end: 80,
  text: "Frame 1",
  animation: {
    animationName: "NoAnimation",
    alignment: "left",
    timeoutTicks: 5000
  }
},
  {
    start: 80,
    end: 128,
    text: "Frame 2",
    animation: {
      animationName: "NoAnimation",
      alignment: "right",
      timeoutTicks: 5000
    }
  },
  {
    start: 128,
    end: 198,
    text: "Frame 3",
    animation: {
      animationName: "NoAnimation",
      alignment: "left",
      timeoutTicks: 5000
    }
  },
  {
    start: 198,
    end: 256,
    text: "Frame 4",
    animation: {
      animationName: "NoAnimation",
      alignment: "right",
      timeoutTicks: 5000
    }
  }
]

const defaultMessagePlayer: MessagePlayer = async (message: MessageSpec) => {
  /*
    const messageParts: Array<MessagePartType> = message.lines.slice(0, 3).map((line: LineType, idx: number) => ({
      text: line.text,
      ...defaultMessage[idx],
    }));
  */
  const framer = new Framer();
  let framedMessage: MessageType = Object.assign(message, {messageId: "test"});
  const playlist: PlaylistType = Object.assign([framedMessage], {playlistId: "test"});
  const messages: Array<Message> = playlist.map(playlistMessage => framer.parse(playlistMessage)).flat();
  return new Promise<void>((resolve) => {
    display.playlist = new PlaylistDisplay(display, messages);
    display.clear();
    display.play().then(resolve);
    // setTimeout(resolve, 5000);
  });
}

function createTextMessage(text: string, options: any): MessageSpec {
  const textLines = text.split(/[\n\r]/);
  return textLines.slice(0, 2).map((textLine, idx) => ({
    text: textLine,
    start: 128 * idx,
    end: 128 * (idx + 1),
    animation: {
      animationName: "NoAnimation",
      alignment: "left",
      timeoutTicks: options.duration
    }
  }));
}


program
  .version('0.0.1')
  .command("playlist")
  .argument('<file>', 'playlist file')
  .action(async (playlistFile: string, command: string) => {
    console.log("Playlist file: " + playlistFile);
  })

async function playSimpleMessage(text: string, options: any) {
  const messagePlayer = defaultMessagePlayer;
  const message = createTextMessage(text.trim(), options);
  await messagePlayer(message);
  await display.close();
}

const playComplexMessage = async (message: Array<MessagePartType>) => {
  // TODO: Validate message
  await defaultMessagePlayer(message);
  await display.close();
};

program
  .command("output")
  .option('-d, --duration <duration>', 'duration of message', (str) => parseInt(str, 10), 5000)
  .argument('<message>', 'message to display (simple string)')
  .action(async (text: string, options: any, command: string) => {
    await playSimpleMessage(text, options);
  })
program
  .command("output-file")
  .argument('<file>', 'file to display (JSON)')
  .action(async (file: string, options: any, command: string) => {
    const fileContents = JSON.parse(readFileSync(file, {encoding: 'utf8', flag: 'r'}));
    await playComplexMessage(fileContents);
  });
program
  .action(async () => {
    console.log("Default action");
    let str = '';
    process.stdin.setEncoding('utf8');
    for await (const chunk of process.stdin) str += chunk;
    console.log(`Outputting: '${str}'`)
    await playSimpleMessage(str.trim(), {duration: 1000});
  })


program.parse(process.argv);
