var _asyncGenerator = function () { function AwaitValue(value) { this.value = value; } function AsyncGenerator(gen) { var front, back; function send(key, arg) { return new Promise(function (resolve, reject) { var request = { key: key, arg: arg, resolve: resolve, reject: reject, next: null }; if (back) { back = back.next = request; } else { front = back = request; resume(key, arg); } }); } function resume(key, arg) { try { var result = gen[key](arg); var value = result.value; if (value instanceof AwaitValue) { Promise.resolve(value.value).then(function (arg) { resume("next", arg); }, function (arg) { resume("throw", arg); }); } else { settle(result.done ? "return" : "normal", result.value); } } catch (err) { settle("throw", err); } } function settle(type, value) { switch (type) { case "return": front.resolve({ value: value, done: true }); break; case "throw": front.reject(value); break; default: front.resolve({ value: value, done: false }); break; } front = front.next; if (front) { resume(front.key, front.arg); } else { back = null; } } this._invoke = send; if (typeof gen.return !== "function") { this.return = undefined; } } if (typeof Symbol === "function" && Symbol.asyncIterator) { AsyncGenerator.prototype[Symbol.asyncIterator] = function () { return this; }; } AsyncGenerator.prototype.next = function (arg) { return this._invoke("next", arg); }; AsyncGenerator.prototype.throw = function (arg) { return this._invoke("throw", arg); }; AsyncGenerator.prototype.return = function (arg) { return this._invoke("return", arg); }; return { wrap: function (fn) { return function () { return new AsyncGenerator(fn.apply(this, arguments)); }; }, await: function (value) { return new AwaitValue(value); } }; }();

const _private_ = new WeakMap();

/**
 * A simplified implement of `Observable()`
 *
 * @see https://tc39.github.io/proposal-observable/
 */
export default class EventStream {
    /**
     * @param {EmitterWrapper} listener
     */
    constructor(listener) {

        const that = {};

        _private_.set(this, that);

        that.boot = that.done = false;

        that.listener = listener;

        that.canceller = that.resolve = that.reject = null;

        that.next = value => that.resolve(value);

        that.fail = error => (that.reject(error), that.done = true);
    }

    listen() {

        const that = _private_.get(this);

        if (that.boot) return;

        try {
            that.canceller = that.listener.call(null, that.next, async value => {

                that.next(value), that.done = true;

                await Promise.resolve();

                try {
                    that.canceller.call(null);
                } catch (error) {
                    that.fail(error);
                }
            }, that.fail);
        } catch (error) {
            that.fail(error);
        }

        that.boot = true;
    }

    [Symbol.asyncIterator]() {
        var _this = this;

        return _asyncGenerator.wrap(function* () {

            const that = _private_.get(_this);

            while (!that.done) yield yield _asyncGenerator.await(new Promise(function (resolve, reject) {
                return that.resolve = resolve, that.reject = reject, _this.listen();
            }));
        })();
    }

    /**
     * @return {*} Final value
     */
    async toPromise() {

        var iterator = this[Symbol.asyncIterator](),
            value;

        while (true) {

            let result = await iterator.next();

            if (result.done) break;

            value = result.value;
        }

        return value;
    }
}

/**
 * Wrapper of Event emitter
 *
 * @typedef {function} EmitterWrapper
 *
 * @param {function(value: *): void}     next
 * @param {function(value: *): void}     done
 * @param {function(error: Error): void} fail
 *
 * @return {Function} Remove Event listeners from the emitter
 */