import Ticker from "./Ticker";
import * as assert from "assert";

describe('Ticker', () => {

  let ticker;
  const startCount = 5;
  const interval = 10;
  let count;
  let start;
  let tickerFunc;
  const error = new Error("This should fail");


  beforeEach(() => {
    start = new Date().getTime();
    count = startCount;
    ticker = new Ticker(interval, () => {
      count--;
      if (tickerFunc) {
        tickerFunc(count);
      }
      return Promise.resolve(count);
    });
  });

  afterEach(() => {
    expect(ticker._timer).toEqual(undefined);
  });

  describe('resolve', () => {
    it('should resolve when done countdown reaches 0', (done) => {
      ticker.countdown().then(() => {
        let end = new Date().getTime();
        if (end - start < interval * startCount) {
          assert.fail();
        } else {
          done();
        }
      });
    }, 1000)
  });

  describe('reject', () => {
    it('should reject when func throws an error', (done) => {
      tickerFunc = () => {
        if (count === 3) {
          throw error;
        }
      };
      ticker.countdown().then(() => {
        assert.fail();
      }).catch(err => {
        if (err === error) {
          done();
        } else {
          assert.fail();
        }
      });
    });

    it('should reject when func rejects', (done) => {
      let ticker = new Ticker(interval, () => {
        return Promise.reject(error);
      });
      ticker.countdown().then(() => {
        assert.fail();
      }).catch(() => {
        done();
      });
    });
  });
});
