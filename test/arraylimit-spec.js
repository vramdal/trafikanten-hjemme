"use strict";
var assert = require("chai").assert;
var arraylimit = require("../rednodes/arraylimit/arraylimit.js");
var arraylimitTest = require("./RedTest.js")(arraylimit);

describe("arraylimit", function() {
    it("should limit the length the incoming array to 2", function(done) {
        arraylimitTest({"limit": 2}).trigger("input", {"payload": [1, 2, 3]}, function(msg) {
            assert.equal(msg.payload.length, 2);
            done();
        });
    });
    it("should not alter the array if length is <= 2", function(done) {
        arraylimitTest({"limit": 2}).trigger("input", {"payload": [1, 2]}, function(msg) {
            assert.equal(msg.payload.length, 2);
            done();
        });
    });
    it("should just pass the message on if the payload is not an array", function(done) {
        arraylimitTest({"limit": 2}).trigger("input", {"payload": "Some random string"}, function(msg) {
            assert.equal(msg.payload, "Some random string");
            done();
        });
    });
    it("should just pass the message on if the message does not have a payload", function(done) {
        arraylimitTest({"limit": 2}).trigger("input", {"something": "Some random string"}, function(msg) {
            assert.equal(msg.something, "Some random string");
            assert.isUndefined(msg.payload);
            done();
        });
    });
});
