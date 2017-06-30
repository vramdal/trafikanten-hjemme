// @flow

import type {Bitmap} from "./Bitmap";
import type {Byte} from "./SimpleTypes";

function BitmapProxy(source: Bitmap, width: number, getIdxTranslatedFunc : (idx : number) => Byte) : Bitmap {
    return new Proxy(new Uint8Array(source.buffer, source.byteOffset, source.length), {

            subarray: function(begin = 0, end : number) {
                let result = new Array(end - begin);
                for (let i = begin; i < end; i++) {
                    result[i] = getIdxTranslatedFunc(i);
                }
                return result;
            },
            get: function(target, propertyKey) {
                let idx;
                if (typeof propertyKey === "string" && !isNaN(parseInt(propertyKey))) {
                    idx = parseInt(propertyKey, 10);
                } else if (typeof propertyKey === "number") {
                    idx = propertyKey;
                }
                if (idx !== undefined) {
                    return this.getByIdx(idx);
                } else if (propertyKey === "length") {
                    return width;
                } else if (this[propertyKey]) {
                    return this[propertyKey];
                } else {
                    return Reflect.get(target, propertyKey, target);
                }
            },
            getByIdx: function(idx) {
                return getIdxTranslatedFunc(idx);
            }

        });
}

//noinspection JSUnusedGlobalSymbols
const classProxy = new Proxy(BitmapProxy, {
        construct: (target : BitmapProxy, argumentsList, originalConstructor) => {
/*
            let bitmap : Bitmap = argumentsList[0];
            let width : number = argumentsList[1];
            let getIdxTranslatedFunc : (idx : number) => Byte = argumentsList[2];
*/
            console.log("This is the proxied constructor");
            return originalConstructor.apply(null, argumentsList);

            }
        }
    );

module.exports = classProxy;