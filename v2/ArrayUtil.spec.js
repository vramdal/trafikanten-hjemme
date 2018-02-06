let expect = require("chai").expect;
const ArrayUtil = require("./ArrayUtil");

describe('ArrayUtil', () => {
    it('should sum the property value of all elements in an array', function () {
        let arr = [{val: 1}, {val: 2}, {val: 3}, {val: 4}];
        let reducer = ArrayUtil.sumProperty(el => el.val);
        let sum = arr.reduce(reducer, 0);
        expect(sum).to.eql(10);
    });
});