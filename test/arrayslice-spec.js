"use strict";
var assert = require("chai").assert;
var arrayslice = require("../rednodes/arrayslice/arrayslice.js");
var arraysliceTest = require("./RedTest.js")(arrayslice);

describe("arrayslice", function() {
    it("should force the payload to be an array", function(done) {
        arraysliceTest({"forceArray": true}).trigger("input", {"payload": "some random string"}, function(msg) {
            assert.isArray(msg.payload);
            done();
        });
    });
    it("should not force the payload into an array if it's already an array", function(done) {
        arraysliceTest({"forceArray": true}).trigger("input", {"payload": [1, 2, 3]}, function(msg) {
            assert.isArray(msg.payload);
            assert.isNotArray(msg.payload[0]);
            done();
        });
    });
    it("should create an array if there's no payload", function(done) {
        arraysliceTest({"forceArray": true}).trigger("input", {"key": "value"}, function(msg) {
            assert.isArray(msg.payload, "did not create array with empty payload");
            assert.equal(msg.payload.length, 0);
            done();
        });
    });
    it("should skip elements before number 2", function(done) {
        arraysliceTest({from: 2}).trigger("input", {"payload": [1, 2, 3, 4]}, function(msg) {
            assert.isArray(msg.payload);
            assert.equal(msg.payload.length, 2);
            assert.equal(msg.payload[0], 3);
            done();
        });
    });
    it("should not include elements after number 2", function(done) {
        arraysliceTest({to: 2}).trigger("input", {"payload": [1, 2, 3, 4]}, function(msg) {
            assert.isArray(msg.payload);
            assert.equal(msg.payload.length, 2);
            assert.equal(msg.payload[0], 1);
            done();
        });
    });
    it("should only include elements number 2 and 3", function(done) {
        arraysliceTest({from: 2, to: 4}).trigger("input", {"payload": [1, 2, 3, 4, 5]}, function(msg) {
            assert.isArray(msg.payload);
            assert.equal(msg.payload.length, 2);
            assert.equal(msg.payload[0], 3);
            assert.equal(msg.payload[1], 4);
            done();
        });
    });
    it("should not return an array, with a single element", function(done) {
        arraysliceTest({from: 2, to: 3}).trigger("input", {"payload": [1, 2, 3, 4]}, function(msg) {
            assert.isNotArray(msg.payload);
            assert.equal(msg.payload, 3);
            done();
        });
    });
    it("should return an array, even with a single element", function(done) {
        arraysliceTest({from: 2, to: 3, forceArray: true}).trigger("input", {"payload": [1, 2, 3, 4]}, function(msg) {
            assert.isArray(msg.payload);
            assert.equal(msg.payload.length, 1);
            assert.equal(msg.payload[0], 3);
            done();
        });
    });
});
