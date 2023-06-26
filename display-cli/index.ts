import { Command } from "commander";
import { LedModuleRow } from "./led-module";
var gpiop = require('rpi-gpio').promise;

const readline = require('readline');

const ledModuleRows = [new LedModuleRow(0), new LedModuleRow(1)];
ledModuleRows[0].init().then(() => {ledModuleRows[1].init()})

const MISO_PIN = 21;

gpiop.setup(MISO_PIN, gpiop.DIR_IN).then(() => {

});

const program = new Command();

program.version('0.0.1');
program.command('findLeds').action(() => {
  console.log("Finding leds");
  Promise.all(ledModuleRows.map((row) => row.findLeds()));
});

async function selectChip(chipIdx) {
  console.log(`Selecting chip ${chipIdx}`);
  const rowIdx = Math.floor(chipIdx / 4);
  const chipInRowIdx = chipIdx % 4;
  const ledModule = ledModuleRows[rowIdx].getModule(chipInRowIdx);
  try {
    await ledModule.selectChip();
    await ledModuleRows[rowIdx].identify();
  } catch (err) {
    console.log('Error Led Module Init: ', err.toString())
  }
}

program.command('selectChip <chipIdx>').action(async (chipIdx) => {
  await selectChip(chipIdx);
});

program.command('cli').action(() => {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: true
  });

  console.log("Skriv et tall fra 0 til 7");

  rl.on('line', async (line) => {
    const chipIdx = parseInt(line);
    if (isNaN(chipIdx) || chipIdx > 7 || chipIdx < 0) {
      console.log("Ugyldig input");
      return;
    }
    await selectChip(chipIdx);
  });

  rl.once('close', () => {
    // end of input
  });
});

program.parse();
