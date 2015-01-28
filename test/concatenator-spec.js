"use strict";
var assert = require("chai").assert;
var concatenator = require("../rednodes/concatenator/concatenator");
var concatenatorTest = require("./RedTest.js")(concatenator);

describe("concatenator", function() {
    it("should concatenate two strings", function(done) {
        var concatenator = concatenatorTest();
        concatenator.trigger("input", {"payload": ["some random string 1", "some random string 2"]}, function(msg) {
            assert.equal("some random string 1" + concatenator.glue + "some random string 2", msg.payload);
            done();
        });
    });
    it("should not join on only one string", function(done) {
        var concatenator = concatenatorTest();
        concatenator.trigger("input", {"payload": ["some random string 1"]}, function(msg) {
            assert.equal("some random string 1", msg.payload);
            done();
        });
    });
    it("should not do anything if payload is not an array", function(done) {
        var concatenator = concatenatorTest();
        concatenator.trigger("input", {"payload": "some random string 1"}, function(msg) {
            assert.equal("some random string 1", msg.payload);
            done();
        });
    });
});
