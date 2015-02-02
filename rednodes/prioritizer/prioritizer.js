var RED = require("node-red");
var events = require("../../modules/redevents");

module.exports = function(RED) {
    function prioritizer(config) {
        RED.nodes.createNode(this, config);
        RED.log.addHandler(this);
        var _this = this;
        var providerIds = config["priorities"];
        var defaultExpiryMs = 1000; // TODO - configurable per provider
        var messageIdProviderIdMap = {};
        var prioritizedMessages = [];
        var messageIdPriorityMap = {};
        this.on("log", function(metric) {
            if (metric.event == "Node.prototype.send") {
                if (providerIds.indexOf(metric.nodeid) != -1) {
                    messageIdProviderIdMap[metric.msguuid] = {
                        "sender": metric.nodeid,
                        "timestamp": new Date()
                    }
                }
            }
        });
        events.on("messageDisplayComplete", function(msgId) {
            console.log("Visning av", msgId, "er ferdig");
            _this.removeMessageIfExpired(msgId);
            _this.sendNextMsg();
        });
        this.removeMessageIfExpired = function(msgId) {
            var priority = messageIdPriorityMap[msgId];
            if (priority != undefined) {
                var msg = prioritizedMessages[priority];
                var now = new Date();
                if (now.getTime() - msg.sent.getTime() + defaultExpiryMs < 0) {
                    delete messageIdPriorityMap[msgId];
                    delete prioritizedMessages[priority];
                }
            }
        };
        this.on("input", function(msg) {
            var priority = Number.MAX_VALUE;
            var msgId = msg["_messageUuid"];
            if (messageIdProviderIdMap[msgId] == undefined) {
                console.warn("Unknown sender for message, cannot prioritize. Using default priority." + msgId);
            } else {
                var senderId = messageIdProviderIdMap[msgId]["sender"];
                delete messageIdProviderIdMap[msgId];
                priority = providerIds.indexOf(senderId);
                if (priority == -1) {
                    console.warn("Unknown provider id " + senderId + " for message " + msgId);
                    priority = Number.MAX_VALUE;
                }
            }
            msg.priority = priority;
            prioritizedMessages[priority] = msg;
            messageIdPriorityMap[msgId] = {priority: priority};
            _this.sendNextMsg();
        });
        this.sendNextMsg = function() {
            for (var i = 0; i < prioritizedMessages.length; i++) {
                var msg = prioritizedMessages[i];
                if (msg != undefined) {
                    msg.sent = new Date();
                    var outgoingNum = _this.wires[0].length;
                    var msgArr = [];
                    for (var j = 0; i < outgoingNum; j++) {
                        msgArr.push(msg);
                    }
                    _this.send(msgArr);
                    break;
                }
            }
        }

    }
    RED.nodes.registerType("prioritizer", prioritizer);
};