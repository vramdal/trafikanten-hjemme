// noinspection JSUnusedLocalSymbols

import { program } from "commander";

program.version("0.0.1")
  .action(async (playlistFile: string, command: string) => {
    console.log("Default display");
    let str = '';
    process.stdin.setEncoding('utf8');
    for await (const chunk of process.stdin) str += chunk;
    console.log(`Outputting: '${str}'`)

  })
