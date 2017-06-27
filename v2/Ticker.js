// @flow

export type CountdownPromise = Promise<number>;

class Ticker {
    _interval: number;
    _timer: number;
    _func: () => CountdownPromise;
    _promise: Promise<any>;
    _resolver: () => void;

    constructor(interval: number, func: () => CountdownPromise) {
        this._interval = interval;
        this._func = func;
    }

    countdown() : Promise<any> {
        this._promise = new Promise(resolve => {
            this._resolver = resolve;
        });
        this._timer = setInterval(this.tick.bind(this), this._interval);
        return this._promise;
    }

    stop() {
        clearInterval(this._timer);
    }

    tick() {
        this._func().then(remainingUnits => {
            if (remainingUnits <= 0) {
                this._resolver();
            }
        }).catch(err => Promise.reject(err));
    }

}

module.exports = Ticker;