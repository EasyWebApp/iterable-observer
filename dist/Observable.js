var _asyncGenerator = function () { function AwaitValue(value) { this.value = value; } function AsyncGenerator(gen) { var front, back; function send(key, arg) { return new Promise(function (resolve, reject) { var request = { key: key, arg: arg, resolve: resolve, reject: reject, next: null }; if (back) { back = back.next = request; } else { front = back = request; resume(key, arg); } }); } function resume(key, arg) { try { var result = gen[key](arg); var value = result.value; if (value instanceof AwaitValue) { Promise.resolve(value.value).then(function (arg) { resume("next", arg); }, function (arg) { resume("throw", arg); }); } else { settle(result.done ? "return" : "normal", result.value); } } catch (err) { settle("throw", err); } } function settle(type, value) { switch (type) { case "return": front.resolve({ value: value, done: true }); break; case "throw": front.reject(value); break; default: front.resolve({ value: value, done: false }); break; } front = front.next; if (front) { resume(front.key, front.arg); } else { back = null; } } this._invoke = send; if (typeof gen.return !== "function") { this.return = undefined; } } if (typeof Symbol === "function" && Symbol.asyncIterator) { AsyncGenerator.prototype[Symbol.asyncIterator] = function () { return this; }; } AsyncGenerator.prototype.next = function (arg) { return this._invoke("next", arg); }; AsyncGenerator.prototype.throw = function (arg) { return this._invoke("throw", arg); }; AsyncGenerator.prototype.return = function (arg) { return this._invoke("return", arg); }; return { wrap: function (fn) { return function () { return new AsyncGenerator(fn.apply(this, arguments)); }; }, await: function (value) { return new AwaitValue(value); } }; }();

const _queue_ = new WeakMap();

export default class Observable {
    /**
     * @param {EmitterWrapper} emitter
     */
    constructor(emitter) {

        const queue = [];

        _queue_.set(this, queue);

        var next;

        const wait = () => queue.push(new Promise(resolve => next = resolve));

        wait();

        this.done = false;

        emitter(value => (next(value), wait()), value => (next(value), this.done = true));
    }

    [Symbol.asyncIterator]() {
        var _this = this;

        return _asyncGenerator.wrap(function* () {

            const queue = _queue_.get(_this);

            for (let i = 0; !_this.done; i++) yield yield _asyncGenerator.await(queue[i]);
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
 * @param {function} next
 * @param {function} done
 */