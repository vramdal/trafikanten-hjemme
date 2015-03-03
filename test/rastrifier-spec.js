"use strict";
var assert = require("chai").assert;
var rastrifier = require("../rednodes/displaySection/rastrifier");

describe("rastrifier", function() {
    it("should output an empty screen when payload is null", function() {
        var bitmap = rastrifier.rastrify({payload: null});
        var sum = 0;
        for (var i = 0; i < bitmap.length; i++) {
            sum += bitmap[i];
        }
        assert.equal(sum, 0);
    });
});
