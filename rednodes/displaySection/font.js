/**
 * Created by viramd on 24.10.2014.
 */

module.exports = init();

function init() {

    this.map = {};
    var _this = this;

    function registerCharacter(ch, width) {
        var args = Array.prototype.slice.call(arguments);
        var lines = args.slice(2);
        var bytes = [];
        for (var i = 0; i < width; i++) {
            var str = "";
            for (var l = 0; l < lines.length; l++) {
                var line = lines[l];
                str += line[i];
            }
            var byte = parseInt(str.replace(/X/g, '1').replace(/\s/g, '0'), 2);
            bytes.push(byte);
        }
        /*
         for (var i = 0; i < lines.length; i++) {
         var line = lines[i];
         if (line.length != width) {
         throw new Error("Line " + i + " for character " + ch + " does not match indicated width of " + width);
         }
         line = line.replace('X', 1).replace(' ', 0);
         var byte = parseInt(line, 2);
         bytes.push(byte);
         }
         */
        _this.map[ch] = {bytes: bytes, width: width};
    }

    registerCharacter('!', 5,
            "     ",
            "  X  ",
            "  X  ",
            "  X  ",
            "  X  ",
            "     ",
            "  X  ",
            "     ");
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
    registerCharacter('X', 5,
            "     ",
            " XXX ",
            "X   X",
            "   X ",
            "  X  ",
            "     ",
            "  X  ",
            "     ");
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
    registerCharacter('t', 5,
            "     ",
            "  X  ",
            "XXXXX",
            "  X  ",
            "  X  ",
            "  X  ",
            "   XX",
            "     ");
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
    registerCharacter('X', 9,
            "    X    ",
            " X XXX X ",
            "  X X X  ",
            " X XXX X ",
            "XXXXXXXXX",
            " X XXX X ",
            "  X X X  ",
            " X XXX X ");
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
            "        ",
            "    XX  ",
            " XXXXXX ",
            " XXXXXX ",
            "XXXXXXXX",
            "XXXXXXXX",
            " XXXXXX "
    );
    registerCharacter('░', 8, // Sky, hul
            "        ",
            "        ",
            "    XX  ",
            " XXX  X ",
            " X    X ",
            "X      X",
            "X      X",
            " XXXXXX "
    );
    registerCharacter('▒', 9, // SunLightRain
            "X  X     ",
            " XX      ",
            " XX      ",
            "X  X     ",
            "         ",
            "  X  X  X",
            " X  X  X ",
            "X  X  X  "
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
    return _this.map;


}
