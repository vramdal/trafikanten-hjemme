// @flow

export type CountdownPromise = Promise<number>;

class Ticker {
    _interval: number;
    _timer: ?IntervalID;
    _func: () => CountdownPromise;
    _promise: Promise<any>;
    _resolver: () => void;
    _rejecter: (err: Error) => void;
    _timingFactor : number;

    constructor(interval: number, func: () => CountdownPromise, timingFactor : number = 1) {
        this._interval = interval;
        this._func = func;
        this._timingFactor = timingFactor;
    }

    countdown() : Promise<any> {
        this._promise = new Promise((resolve, reject) => {
            this._resolver = resolve;
            this._rejecter = reject;
        });
        this._timer = setInterval(this.tick.bind(this), this._interval * this._timingFactor);
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

export default Ticker;
