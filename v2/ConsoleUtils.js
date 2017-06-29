// @flow
class ConsoleUtils {

    static progressBar(percentage: number) {
        let barWidth = 70;
        let full = new Array(barWidth).fill("-");
        let numCompleteChars = Math.ceil((percentage) * barWidth);
        full.fill("|", 0, numCompleteChars);
        let bar = full.join("");
        let percentageStr = Math.floor(percentage * 100).toString(10);
        while (percentageStr.length < 3) {
            percentageStr = " " + percentageStr;
        }
        percentageStr = percentageStr + "%";
        process.stdout.write(bar + " " + percentageStr + "\r");
    }

}

module.exports = ConsoleUtils;