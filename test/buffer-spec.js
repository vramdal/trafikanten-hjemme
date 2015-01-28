"use strict";
var assert = require("chai").assert;
var buffer = require("../rednodes/buffer/buffer");
var bufferTest = require("./RedTest.js")(buffer);

describe("buffer", function() {
    it("should not send a message before the timeout", function(done) {
        setTimeout(done, 10);
        bufferTest({interval: 20}).trigger("input", {"something": "something"}, function() {
            throw new Error("Should not have sent the message");
        });

    });
    it("should send the messages on timeout", function(done) {
        bufferTest({interval: 10}).trigger("input", {"something1": "something1", "topic": "topic1"}, function() {
            throw new Error("Should not have sent the message");
        }).trigger("input", {"something2": "something", topic: "topic2"}, function(msg) {
            assert.isArray(msg.payload);
            assert.equal(msg.topic, "topic1-array");
            done();
        });
    });
    it("should always send an array", function(done) {
        bufferTest({interval: 10}).trigger("input", {"something1": "something1", "topic": "topic1"}, function(msg) {
            assert.isArray(msg.payload);
            assert.equal(msg.payload.length, 1);
            assert.equal(msg.topic, "topic1-array");
            done();
        });
    });
    it("should clear the interval timer on close", function(done) {
        var test = bufferTest({interval: 10}).trigger("close", {}, function() {});
        setTimeout(function() {
            assert.isUndefined(test.intervalRef);
            done();
        }, 20);
    });

});
