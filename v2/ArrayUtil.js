// @flow

class ArrayUtil {

    /**
     * Usage:
     * let arr = [{num: 1}, {num: 2}, {num: 3}];
     * console.log(arr.reduce(sumProperty(el => el.num), 0)
     * => 6
     * @param extractor A function that extracts the value being summed
     * @return {function(number, T): *} A function for use with Array.reduce()
     */
    static sumProperty<T>(extractor: (obj : T) => number) {
        return (currentSum : number, currentElement : T) => extractor(currentElement) + currentSum;
    }


}

module.exports = ArrayUtil;