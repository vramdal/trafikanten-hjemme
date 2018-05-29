// @flow

import type {MessageProviderIcalAdapter} from "./provider/MessageProvider";

const registry : {[name: string]: MessageProviderIcalAdapter<any>} = {};

function register(name : string, mpf : MessageProviderIcalAdapter<any>) {
   registry[name] = mpf;
}

function get(name : string) {
    return registry[name];
}

module.exports = {register, get};