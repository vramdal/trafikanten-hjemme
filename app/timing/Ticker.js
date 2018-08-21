// @flow

const timingFactor = require("../settings").timingFactor;

export type CountdownPromise = Promise<number>;

class Ticker {
    _interval: number;
    _timer: ?IntervalID;
    _func: () => CountdownPromise;
    _promise: Promise<any>;
    _resolver: () => void;
    _rejecter: (err: Error) => void;

    constructor(interval: number, func: () => CountdownPromise) {
        this._interval = interval;
        this._func = func;
    }

    countdown() : Promise<any> {
        this._promise = new Promise((resolve, reject) => {
            this._resolver = resolve;
            this._rejecter = reject;
        });
        this._timer = setInterval(this.tick.bind(this), this._interval * timingFactor);
        return this._promise;
    }

    stop() {
        if (this._timer) {
            clearInterval(this._timer);
        }
        this._timer = undefined;
    }

    _resolve() {
        this.stop();
        this._resolver();
    }

    _reject(err : Error) {
        this.stop();
        this._rejecter(err);
    }

    tick() {
        try {
            this._func().then(remainingUnits => {
                if (remainingUnits <= 0) {
                    this._resolve();
                }
            }).catch(err => {
                this._reject(err);
            });
        } catch (err) {
            this._reject(err);
        }
    }

}

module.exports = Ticker;