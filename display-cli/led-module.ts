var gpiop = require('rpi-gpio').promise;
var HT1632 = require('ht1632');

export type byte = number;

class LedModule {
  private readonly chipIdx: number;
  private multiplexerPins: Array<number>;
  private multiplexerPinValues: Array<number>;
  private row: LedModuleRow;

  constructor(row: LedModuleRow, chipIdx: number) {
    this.chipIdx = chipIdx;
    if (this.chipIdx < 4) {
      this.multiplexerPins = [11, 12];
    } else {
      this.multiplexerPins = [13, 15];
    }
    if (this.chipIdx % 4 === 0) {
      this.multiplexerPinValues = [0, 0];
    } else if (this.chipIdx % 4 === 1) {
      this.multiplexerPinValues = [0, 1];
    } else if (this.chipIdx % 4 === 2) {
      this.multiplexerPinValues = [1, 0];
    } else if (this.chipIdx % 4 === 3) {
      this.multiplexerPinValues = [1, 1];
    }
  }

  async init() {
    console.log(`Initializing chip ${this.chipIdx}`);
    await Promise.all(this.multiplexerPins.map(async (pin) => gpiop.setup(pin, gpiop.DIR_OUT)));

  }

  async findLeds() {
    await this.selectChip();
    await this.row.findLeds();
  }

  clearMatrix() {
    console.log(`Clearing matrix ${this.chipIdx}`);
  }

  writeMatrix() {
    console.log(`Writing matrix ${this.chipIdx}`);
  }

  drawPixel(x: number, y: number, value: boolean) {
    console.log(`Drawing pixel ${x}, ${y} as ${value} on matrix ${this.chipIdx}`);
  }

  drawByte(x: number, value: byte) {
    console.log(`Drawing byte ${value} on matrix ${this.chipIdx}`);
  }

  private async digitalWrite(pin: number, value: number) {
    await gpiop.write(pin, value !== 0);
  }

  async selectChip() {
    console.log(`Selecting chip ${this.chipIdx}`);
    return await Promise.all(this.multiplexerPins.map(async (pin, idx) => this.digitalWrite(pin, this.multiplexerPinValues[idx])));
  }
}

export class LedModuleRow {

  private readonly ledModules: Array<LedModule>;
  private readonly rowIdx: number;
  private channel: number;
  private display: ReturnType<typeof HT1632.initialize>;
  constructor(rowIdx: number) {
    this.rowIdx = rowIdx;
    this.channel = rowIdx;
    this.ledModules = [0, 1, 2, 3].map((chipIdx) => new LedModule(this, chipIdx));
  }

  async init() {
    console.log(`Initializing row ${this.rowIdx}`)
    this.display = HT1632.initialize(`/dev/spidev0.${this.channel}`, HT1632.mode.MODE_8NMOS);
    const initializers = this.ledModules.map((ledModule) => () => ledModule.init());
    for (const initializer of initializers) {
      await initializer();
    }
    console.log(`Initialized row ${this.rowIdx}`)
  }

  async findLeds() {
    await this.display.findLeds();
  }

  getModule(chipIdx: number) {
    return this.ledModules[chipIdx];
  }

  async identify() {
    console.log(`Identifying row ${this.rowIdx}`);
    await this.display.writeAddress(0x00, true, true, true, true);
  }

}
