var modules = {};

function RedTest(testedModule) {
    var _this = this;
    var RED = {
        nodes: {
            createNode: function(){},
            registerType: function(name, _func){
                modules[name] = _func;
                modules[name].eventHandlers = {};
                modules[name].on = function(event, eventHandler) {
                    modules[name].eventHandlers[event] = eventHandler;
                };
                modules[name].status = function(spec) {
                    modules[name].nodeStatus = spec;
                };
                modules[name].trigger = function(event, msg, callback) {
                    modules[name].send = callback;
                    modules[name].eventHandlers[event](msg);
                    return modules[name];
                };
                _this.setup = function(config) {
                    modules[name].node = modules[name].bind(modules[name])(config);
                    return modules[name];
                };
            }
        }
    };
    testedModule(RED);
    return this.setup;
}

module.exports = RedTest;
