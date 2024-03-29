export type FontCharSpec = {char: string | number, width : number, uint8Array: Uint8Array}
export type FontMap = {
    byteArray: Uint8Array,
    bytes: {[key: string | number] : Uint8Array},
    kerning: (ch1 : string | number, ch2 : string | number) => number
}

export default init();


function init() {

    let characters : Array<FontCharSpec> = [];


    function registerCharacter(ch : string | number, width : number, ...lines) {
        const bytes = [];
        for (let i = 0; i < width; i++) {
            let str = "";
            for (let l = 0; l < lines.length; l++) {
                let line = lines[l];
                str += line[i];
            }
            let byte = parseInt(str.replace(/X/g, '1').replace(/\s/g, '0'), 2);
            bytes.push(byte);
        }
        let uint8Array = Uint8Array.from(bytes);
        let fontCharSpec = {char: ch, width: width, uint8Array: uint8Array};
        characters.push(fontCharSpec);
    }

    registerCharacter('…', 5,
            "     ",
            "     ",
            "     ",
            "     ",
            "     ",
            "     ",
            "X X X",
            "     ");
    registerCharacter('!', 5,
            "     ",
            "  X  ",
            "  X  ",
            "  X  ",
            "  X  ",
            "     ",
            "  X  ",
            "     ");
    registerCharacter('?', 5,
            " XXX ",
            "X   X",
            "    X",
            "    X",
            "   X ",
            "  X  ",
            "     ",
            "  X  ");
    registerCharacter('"', 5,
            "     ",
            "XX XX",
            " X  X",
            "X  X ",
            "     ",
            "     ",
            "     ",
            "     ");
    registerCharacter('#', 5,
            "     ",
            "     ",
            " X X ",
            "XXXXX",
            " X X ",
            "XXXXX",
            " X X ",
            "     ");
    registerCharacter('$', 5,
            "     ",
            "  X  ",
            " XXXX",
            "X X  ",
            " XXX ",
            "  X X",
            "XXXX ",
            "     ");
    registerCharacter('%', 5,
            "     ",
            "     ",
            "XX  X",
            "XX X ",
            "  X  ",
            " X XX",
            "X  XX",
            "     ");
    registerCharacter('&', 5,
            "     ",
            "     ",
            " XX  ",
            "X  X ",
            " XX  ",
            "X  XX",
            " XXXX",
            "     ");
    registerCharacter('\'', 5,
            "     ",
            " XX  ",
            " XX  ",
            " X   ",
            "     ",
            "     ",
            "     ",
            "     ");
    registerCharacter('(', 5,
            "     ",
            "   X ",
            "  X  ",
            "  X  ",
            " X   ",
            "  X  ",
            "  X  ",
            "   X ");
    registerCharacter(')', 5,
            "     ",
            " X   ",
            "  X  ",
            "  X  ",
            "   X ",
            "  X  ",
            "  X  ",
            " X   ");
    registerCharacter('*', 5,
            "X   X",
            " X X ",
            "  X  ",
            "XXXXX",
            "  X  ",
            " X X ",
            "X   X",
            "     ");
    registerCharacter('+', 5,
            "     ",
            "     ",
            "  X  ",
            "  X  ",
            "XXXXX",
            "  X  ",
            "  X  ",
            "     ");
    registerCharacter(',', 5,
            "     ",
            "     ",
            "     ",
            "     ",
            "     ",
            " XX  ",
            "  X  ",
            " X   ");
    registerCharacter('-', 5,
            "     ",
            "     ",
            "     ",
            "     ",
            "XXXXX",
            "     ",
            "     ",
            "     ");
    registerCharacter('_', 5,
            "     ",
            "     ",
            "     ",
            "     ",
            "     ",
            "     ",
            "     ",
            "XXXXX");
    registerCharacter('.', 5,
            "     ",
            "     ",
            "     ",
            "     ",
            "     ",
            "  XX ",
            "  XX ",
            "     ");
    registerCharacter('/', 5,
            "     ",
            "     ",
            "    X",
            "   X ",
            "  X  ",
            " X   ",
            "X    ",
            "     ");
    registerCharacter('0', 4,
            "    ",
            " XX ",
            "X  X",
            "X  X",
            "X  X",
            "X  X",
            " XX ",
            "    ");
    registerCharacter('1', 4,
            "    ",
            "  X ",
            " XX ",
            "  X ",
            "  X ",
            "  X ",
            " XXX",
            "    ");
    registerCharacter('2', 4,
            "    ",
            " XX ",
            "X  X",
            "   X",
            " XX ",
            "X   ",
            "XXXX",
            "    ");
    registerCharacter('3', 4,
            "    ",
            " XX ",
            "X  X",
            "  X ",
            "   X",
            "X  X",
            " XX ",
            "    ");
    registerCharacter('4', 4,
            "    ",
            "X  X",
            "X  X",
            "XXXX",
            "   X",
            "   X",
            "   X",
            "    ");
    registerCharacter('5', 4,
            "    ",
            "XXXX",
            "X   ",
            "X   ",
            " XXX",
            "   X",
            "XXX ",
            "    ");
    registerCharacter('6', 4,
            "    ",
            " XXX",
            "X   ",
            "XXX ",
            "X  X",
            "X  X",
            " XX ",
            "    ");
    registerCharacter('7', 4,
            "    ",
            "XXX ",
            "   X",
            "  X ",
            " X  ",
            "X   ",
            "X   ",
            "    ");
    registerCharacter('8', 4,
            "    ",
            " XX ",
            "X  X",
            " XX ",
            "X  X",
            "X  X",
            " XX ",
            "    ");
    registerCharacter('9', 4,
            "    ",
            " XX ",
            "X  X",
            "X  X",
            " XX ",
            "   X",
            " XX ",
            "    ");
    registerCharacter(':', 1,
            " ",
            " ",
            "X",
            "X",
            " ",
            "X",
            "X",
            " ");
    registerCharacter(';', 5,
            "     ",
            "     ",
            "  XX ",
            "  XX ",
            "     ",
            "  XX ",
            " X   ",
            "     ");
    registerCharacter('<', 5,
            "     ",
            "     ",
            "   X ",
            "  X  ",
            " X   ",
            "  X  ",
            "   X ",
            "     ");
    registerCharacter('=', 5,
            "     ",
            "     ",
            "     ",
            "XXXXX",
            "     ",
            "XXXXX",
            "     ",
            "     ");
    registerCharacter('>', 5,
            "     ",
            "     ",
            " X   ",
            "  X  ",
            "   X ",
            "  X  ",
            " X   ",
            "     ");
/*
    registerCharacter('X', 5,
            "     ",
            " XXX ",
            "X   X",
            "   X ",
            "  X  ",
            "     ",
            "  X  ",
            "     ");
*/
    registerCharacter('@', 5,
            "     ",
            " XXX ",
            "X  XX",
            "X X X",
            "X XXX",
            "X    ",
            " XXXX",
            "     ");
    registerCharacter('A', 5,
            "     ",
            " XXX ",
            "X   X",
            "X   X",
            "XXXXX",
            "X   X",
            "X   X",
            "     ");
    registerCharacter('B', 5,
            "     ",
            "XXXX ",
            "X   X",
            "XXXX ",
            "X   X",
            "X   X",
            "XXXX ",
            "     ");
    registerCharacter('C', 5,
            "     ",
            " XXX ",
            "X   X",
            "X    ",
            "X    ",
            "X   X",
            " XXX ",
            "     ");
    registerCharacter('D', 5,
            "     ",
            "XXXX ",
            "X   X",
            "X   X",
            "X   X",
            "X   X",
            "XXXX ",
            "     ");
    registerCharacter('E', 5,
            "     ",
            "XXXXX",
            "X    ",
            "XXXX ",
            "X    ",
            "X    ",
            "XXXXX",
            "     ");
    registerCharacter('F', 5,
            "     ",
            "XXXXX",
            "X    ",
            "XXXX ",
            "X    ",
            "X    ",
            "X    ",
            "     ");
    registerCharacter('G', 5,
            "     ",
            " XXX ",
            "X    ",
            "X    ",
            "X  XX",
            "X   X",
            " XXXX",
            "     ");
    registerCharacter('H', 5,
            "     ",
            "X   X",
            "X   X",
            "XXXXX",
            "X   X",
            "X   X",
            "X   X",
            "     ");
    registerCharacter('I', 3,
            "   ",
            "XXX",
            " X ",
            " X ",
            " X ",
            " X ",
            "XXX",
            "   ");
    registerCharacter('J', 5,
            "     ",
            "XXXXX",
            "    X",
            "    X",
            "    X",
            "X   X",
            " XXX ",
            "     ");
    registerCharacter('K', 5,
            "     ",
            "X   X",
            "X  X ",
            "XXX  ",
            "XXX  ",
            "X  X ",
            "X   X",
            "     ");
    registerCharacter('L', 5,
            "     ",
            "X    ",
            "X    ",
            "X    ",
            "X    ",
            "X    ",
            "XXXXX",
            "     ");
    registerCharacter('M', 5,
            "     ",
            "X   X",
            "XX XX",
            "X X X",
            "X   X",
            "X   X",
            "X   X",
            "     ");
    registerCharacter('N', 5,
            "     ",
            "X   X",
            "XX  X",
            "X X X",
            "X  XX",
            "X   X",
            "X   X",
            "     ");
    registerCharacter('O', 5,
            "     ",
            " XXX ",
            "X   X",
            "X   X",
            "X   X",
            "X   X",
            " XXX ",
            "     ");
    registerCharacter('P', 5,
            "     ",
            "XXXX ",
            "X   X",
            "XXXX ",
            "X    ",
            "X    ",
            "X    ",
            "     ");
    registerCharacter('Q', 5,
            "     ",
            " XX  ",
            "X  X ",
            "X  X ",
            "X  X ",
            "X XX ",
            " XX X",
            "     ");
    registerCharacter('R', 4,
            "    ",
            "XXX ",
            "X  X",
            "XXX ",
            "X  X",
            "X  X",
            "X  X",
            "    ");
    registerCharacter('S', 5,
            "     ",
            " XXXX",
            "X    ",
            " XXX ",
            "    X",
            "X   X",
            " XXX ",
            "     ");
    registerCharacter('T', 5,
            "     ",
            "XXXXX",
            "  X  ",
            "  X  ",
            "  X  ",
            "  X  ",
            "  X  ",
            "     ");
    registerCharacter('U', 4,
            "    ",
            "X  X",
            "X  X",
            "X  X",
            "X  X",
            "X  X",
            " XX ",
            "    ");
    registerCharacter('V', 5,
            "     ",
            "X   X",
            "X   X",
            "X   X",
            " X X ",
            " X X ",
            "  X  ",
            "     ");
    registerCharacter('W', 5,
            "     ",
            "X   X",
            "X   X",
            "X   X",
            "X X X",
            "X X X",
            " X X ",
            "     ");
    registerCharacter('X', 5,
            "     ",
            "X   X",
            " X X ",
            "  X  ",
            "  X  ",
            " X X ",
            "X   X",
            "     ");
    registerCharacter('Y', 5,
            "     ",
            "X   X",
            "X   X",
            " X X ",
            "  X  ",
            "  X  ",
            "  X  ",
            "     ");
    registerCharacter('Z', 5,
            "     ",
            "XXXXX",
            "   X ",
            "  X  ",
            " X   ",
            "X    ",
            "XXXXX",
            "     ");
    registerCharacter('[', 5,
            "     ",
            " XXX ",
            " X   ",
            " X   ",
            " X   ",
            " X   ",
            " XXX ",
            "     ");
    registerCharacter('\\', 5,
            "     ",
            "     ",
            "X    ",
            " X   ",
            "  X  ",
            "   X ",
            "    X",
            "     ");
    registerCharacter(']', 5,
            "     ",
            " XXX ",
            "   X ",
            "   X ",
            "   X ",
            "   X ",
            " XXX ",
            "     ");
    registerCharacter('^', 5,
            "     ",
            "  X  ",
            " X X ",
            "X   X",
            "     ",
            "     ",
            "XXXXX",
            "     ");
    registerCharacter('`', 5,
            "     ",
            "  X  ",
            "   X ",
            "     ",
            "     ",
            "     ",
            "     ",
            "     ");
    registerCharacter('a', 5,
            "     ",
            "     ",
            " XXX ",
            "    X",
            " XXXX",
            "X   X",
            "XXXXX",
            "     ");
    registerCharacter('b', 4,
            "    ",
            "X   ",
            "X   ",
            "XXX ",
            "X  X",
            "X  X",
            "XXX ",
            "    ");
    registerCharacter('c', 5,
            "     ",
            "     ",
            " XXX ",
            "X    ",
            "X    ",
            "X    ",
            " XXX ",
            "     ");
    registerCharacter('d', 4,
            "    ",
            "   X",
            "   X",
            " XXX",
            "X  X",
            "X  X",
            " XXX",
            "    ");
    registerCharacter('e', 5,
            "     ",
            "     ",
            " XXX ",
            "X   X",
            "XXXXX",
            "X    ",
            " XXX ",
            "     ");
    registerCharacter('f', 5,
            "     ",
            "  XXX",
            " X   ",
            " X   ",
            "XXXX ",
            " X   ",
            " X   ",
            "     ");
    registerCharacter('g', 4,
            "    ",
            "    ",
            " XXX",
            "X  X",
            "XXXX",
            "   X",
            "   X",
            " XXX");
    registerCharacter('h', 5,
            "     ",
            "X    ",
            "X    ",
            "XXXX ",
            "X   X",
            "X   X",
            "X   X",
            "     ");
    registerCharacter('i', 3,
            "   ",
            " X ",
            "   ",
            "XX ",
            " X ",
            " X ",
            "XXX",
            "   ");
    registerCharacter('j', 5,
            "     ",
            "  X  ",
            "     ",
            " XXXX",
            "    X",
            "    X",
            "X   X",
            " XXX ");
    registerCharacter('k', 5,
            "     ",
            "X    ",
            "X    ",
            "X  X ",
            "XXX  ",
            "X  X ",
            "X   X",
            "     ");
    registerCharacter('l', 3,
            "   ",
            "XX ",
            " X ",
            " X ",
            " X ",
            " X ",
            "XXX",
            "   ");
    registerCharacter('m', 5,
            "     ",
            "     ",
            "XX X ",
            "X X X",
            "X X X",
            "X X X",
            "X X X",
            "     ");
    registerCharacter('n', 5,
            "     ",
            "     ",
            "X XX ",
            "XX  X",
            "X   X",
            "X   X",
            "X   X",
            "     ");
    registerCharacter('o', 5,
            "     ",
            "     ",
            " XXX ",
            "X   X",
            "X   X",
            "X   X",
            " XXX ",
            "     ");
    registerCharacter('p', 5,
            "     ",
            "     ",
            "XXXX ",
            "X   X",
            "XXXX ",
            "X    ",
            "X    ",
            "X    ");
    registerCharacter('q', 5,
            "     ",
            "     ",
            " XXX ",
            "X  X ",
            " XXX ",
            "   X ",
            "   X ",
            "   XX");
    registerCharacter('r', 4,
            "    ",
            "    ",
            "X XX",
            "XX  ",
            "X   ",
            "X   ",
            "X   ",
            "    ");
    registerCharacter('s', 4,
            "    ",
            "    ",
            " XXX",
            "X   ",
            " XX ",
            "   X",
            "XXX ",
            "    ");
    registerCharacter('t', 3,
            "   ",
            " X ",
            "XXX",
            " X ",
            " X ",
            " X ",
            "  X",
            "   ");
    registerCharacter('u', 5,
            "     ",
            "     ",
            "X   X",
            "X   X",
            "X   X",
            "X   X",
            " XXXX",
            "     ");
    registerCharacter('v', 5,
            "     ",
            "     ",
            "X   X",
            "X   X",
            "X   X",
            " X X ",
            "  X  ",
            "     ");
    registerCharacter('w', 5,
            "     ",
            "     ",
            "X   X",
            "X   X",
            "X X X",
            "X X X",
            " X X ",
            "     ");
    registerCharacter('x', 5,
            "     ",
            "     ",
            "X   X",
            " X X ",
            "  X  ",
            " X X ",
            "X   X",
            "     ");
    registerCharacter('y', 5,
            "     ",
            "     ",
            "X   X",
            "X   X",
            " XXXX",
            "    X",
            "   X ",
            " XX  ");
    registerCharacter('z', 5,
            "     ",
            "     ",
            "XXXXX",
            "   X ",
            "  X  ",
            " X   ",
            "XXXXX",
            "     ");
    registerCharacter('|', 5,
            "     ",
            "  X  ",
            "  X  ",
            "  X  ",
            "  X  ",
            "  X  ",
            "  X  ",
            "     ");
    registerCharacter('~', 5,
            "     ",
            "     ",
            " X   ",
            "X X X",
            "   X ",
            "     ",
            "     ",
            "     ");
    registerCharacter('æ', 5,
            "     ",
            "     ",
            "XXXXX",
            "  X X",
            "XXXXX",
            "X X  ",
            "XXXXX",
            "     ");
    registerCharacter('ø', 5,
            "     ",
            "     ",
            " XXX ",
            "X  XX",
            "X X X",
            "XX  X",
            " XXX ",
            "     ");
    registerCharacter('å', 5,
            "  X  ",
            "     ",
            " XXX ",
            "    X",
            " XXXX",
            "X   X",
            "XXXXX",
            "     ");
    registerCharacter('Æ', 5,
            "     ",
            " XXXX",
            "X X  ",
            "X X  ",
            "XXXXX",
            "X X  ",
            "X XXX",
            "     ");
    registerCharacter('Ø', 5,
            "     ",
            " XXX ",
            "X  XX",
            "X X X",
            "X X X",
            "XX  X",
            " XXX ",
            "     ");
    registerCharacter('Å', 5,
            "  X  ",
            "     ",
            " XXX ",
            "X   X",
            "XXXXX",
            "X   X",
            "X   X",
            "     ");
    registerCharacter(' ', 3,
            "   ",
            "   ",
            "   ",
            "   ",
            "   ",
            "   ",
            "   ",
            "   ");
/*
    registerCharacter('X', 9,
            "    X    ",
            " X XXX X ",
            "  X X X  ",
            " X XXX X ",
            "XXXXXXXXX",
            " X XXX X ",
            "  X X X  ",
            " X XXX X ");
*/
    registerCharacter('☼', 8,  // Sol
            "X      X",
            " X    X ",
            "   XX   ",
            "  XXXX  ",
            "  XXXX  ",
            "   XX   ",
            " X    X ",
            "X      X");
    registerCharacter('▓', 8, // Sky, fylt
            "        ",
            "    XX  ",
            " XXXXXX ",
            " XXXXXX ",
            "XXXXXXXX",
            "XXXXXXXX",
            " XXXXXX ",
            "        "

    );
    registerCharacter('▒', 8, // Sky, halvfylt
            "        ",
            "    XX  ",
            " XXX  X ",
            " XXX  X ",
            "XXXX   X",
            "XXXX   X",
            " XXXXXX ",
            "        "
    );
    registerCharacter('░', 8, // Sky, hul
            "        ",
            "    XX  ",
            " XXX  X ",
            " X    X ",
            "X      X",
            "X      X",
            " XXXXXX ",
            "        "
    );
    registerCharacter(62246, 9, // Light rain
            "         ",
            "     X   ",
            "    X    ",
            "   X     ",
            "         ",
            "     X   ",
            "    X    ",
            "   X     "
    );
    registerCharacter(62247, 9, // Medium rain
            "         ",
            "  X     X",
            " X     X ",
            "X     X  ",
            "         ",
            "  X     X",
            " X     X ",
            "X     X  "
    );
    registerCharacter(62248, 9, // Heavy rain
            "         ",
            "  X  X  X",
            " X  X  X ",
            "X  X  X  ",
            "         ",
            "  X  X  X",
            " X  X  X ",
            "X  X  X  "
    );
    registerCharacter(8202, 1,  // Hair space
            " ",
            " ",
            " ",
            " ",
            " ",
            " ",
            " ",
            " "
    );
    registerCharacter(8203, 0,  // Zero-width space
            "",
            "",
            "",
            "",
            "",
            "",
            "",
            ""
    );
    registerCharacter(9829, 7,
          " XX XX ",
          "XXXXXXX",
          "XXXXXXX",
          "XXXXXXX",
          " XXXXX ",
          "  XXX  ",
          "   X   "
    );
    registerCharacter(11365, 11, // ⱥ
            "  X     X  ",
            "   X   X   ",
            "  XXXXXXX  ",
            " XX XXX XX ",
            "XXXXXXXXXXX",
            "X XXXXXXX X",
            "X X     X X",
            "   XX XX   "
    );
    registerCharacter(11366, 11, // ⱦ
            "  X     X  ",
            "X  X   X  X",
            "X XXXXXXX X",
            " XX XXX XX ",
            "XXXXXXXXXXX",
            "  XXXXXXX  ",
            "  X     X  ",
            " XXX   XXX "
    );
    registerCharacter(11362, 10, // Ɫ
            "   XXXX   ",
            "  XXXXXX  ",
            " XXXXXXXX ",
            "XX XXXX XX",
            "XXXXXXXXXX",
            "   X  X   ",
            "  X XX X  ",
            "XX X  X XX"
    );
    registerCharacter(11371, 16, // Ⱬ
            "                ",
            "     XXXXXX     ",
            "   XXXXXXXXXX   ",
            "  XXXXXXXXXXXX  ",
            " XX XX XX XX XX ",
            "XXXXXXXXXXXXXXXX",
            "  XXX  XX  XXX  ",
            "   X        X   "
    );
    registerCharacter(11378, 14, // Ⱳ
            "     XXXX     ",
            " XXXXXXXXXXXX ",
            "XXXXXXXXXXXXXX",
            "XXXX  XX  XXXX",
            "XXXXXXXXXXXXXX",
            "    XX  XX    ",
            "   XX XX XX   ",
            "XXX        XXX"
    );
    registerCharacter(11363, 9, // Ᵽ
            "  XXXXX  ",
            " XXXXXXX ",
            "XX  X  XX",
            "XX XX XXX",
            "XXXXXXXXX",
            "XXXXXXXXX",
            "XXXXXXXXX",
            "XX X X XX"
    );
    registerCharacter(9601, 1, // ▁
        " ",
        " ",
        " ",
        " ",
        " ",
        " ",
        " ",
        "X"
    );
    registerCharacter(9602, 1, // ▂
        " ",
        " ",
        " ",
        " ",
        " ",
        " ",
        "X",
        "X"
    );
    registerCharacter(9603, 1, // ▃
        " ",
        " ",
        " ",
        " ",
        " ",
        "X",
        "X",
        "X"
    );
    registerCharacter(9604, 1, // ▄
        " ",
        " ",
        " ",
        " ",
        "X",
        "X",
        "X",
        "X"
    );
    registerCharacter(9605, 1, // ▅
        " ",
        " ",
        " ",
        "X",
        "X",
        "X",
        "X",
        "X"
    );
    registerCharacter(9606, 1, // ▆
        " ",
        " ",
        "X",
        "X",
        "X",
        "X",
        "X",
        "X"
    );
    registerCharacter(9607, 1, // ▇
        " ",
        "X",
        "X",
        "X",
        "X",
        "X",
        "X",
        "X"
    );
    registerCharacter(9608, 1, // █
        "X",
        "X",
        "X",
        "X",
        "X",
        "X",
        "X",
        "X"
    );
    registerCharacter(176, 4, // °, degree sign)
        " XX ",
        "X  X",
        " XX ",
        "    ",
        "    ",
        "    ",
        "    ",
        "    "
    );
    registerCharacter(30829, 7, // Day)
        "X  X  X",
        " X   X ",
        "  XXX  ",
        "XXXXXXX",
        "  XXX  ",
        " X   X ",
        "X  X  X",
        "       "
    );
    registerCharacter(12192, 7, // Morning)
        "X  X   ",
        " X     ",
        "  XX   ",
        "XXXX   ",
        "  XX   ",
        " X     ",
        "X  X   ",
        "       "
    );
    registerCharacter(12067, 7, // Evening)
        "   X  X",
        "     X ",
        "   XX  ",
        "   XXXX",
        "   XX  ",
        "     X ",
        "   X  X",
        "       "
    );
    registerCharacter(22812, 7, // Night)
        "  XXX  ",
        " X   X ",
        "X     X",
        "X     X",
        "X     X",
        " X   X ",
        "  XXX  ",
        "       "
    );
    registerCharacter(22900, 11, // Bicycle
        "           ",
        "           ",
        "   X XXXX  ",
        "   X   X   ",
        " XX X X XX ",
        "X  X X X  X",
        "X  X   X  X",
        " XX     XX ");

    registerCharacter(22901, 9, // Padlock
        "  XXXXX  ",
        " XX   XX ",
        " X     X ",
        "X       X",
        "XXXXXXXXX",
        "XXXXXXXXX",
        "XXXXXXXXX",
        "XXXXXXXXX"
    );

    let requiredWidth = 0;
    let positions : {[key: string | number] : number} = {};
    for (let i = 0; i < characters.length; i++) {
        let fontCharSpec = characters[i];
        positions[fontCharSpec.char] = requiredWidth;
        requiredWidth += fontCharSpec.width;
    }
    const noSpacingSet : Array<string | number> = [8202, 9601, 9602, 9603, 9604, 9605, 9606, 9607, 9608];
    const kernPairs : Array<[string | number, string | number, number]> = [
        ["r", "s", 0],
        ["e", "t", 0],
        ["r", "å", 0],
        ["r", "a", 0]
    ];

    // Create a mother Uint8Array, that will hold all character sprites
    let map : FontMap = {
        byteArray: new Uint8Array(requiredWidth),
        bytes: {},
        kerning: (ch1 : string | number, ch2 : string | number) => {
            if (noSpacingSet.includes(ch1) && noSpacingSet.includes(ch2)) {
                return 0;
            } else {
                let kernPair = kernPairs
                    .filter((tuple: [string | number, string | number, number]) => tuple[0] === ch1 && tuple[1] === ch2)
                    .find(tuple => true);
                if (kernPair) {
                    return kernPair[2]
                } else {
                    return 1;
                }
            }
        }};
    for (let i = 0; i < characters.length; i++) {
        let fontCharSpec = characters[i];
        let ch = fontCharSpec.char;
        let position = positions[ch];
        map.byteArray.set(fontCharSpec.uint8Array, position);
        map[ch] = fontCharSpec;
        let subarrayGetter = () => map.byteArray.subarray(position, position + fontCharSpec.width);
        Object.defineProperty(map.bytes, ch, {get: subarrayGetter});
        const propNavn = "uint8Array";
        // We can now disregard the existing uint8Array property value, and redirect it to our mother Uint8Array:
        Object.defineProperty(fontCharSpec, propNavn, {get: subarrayGetter});
    }
    return map;


}
