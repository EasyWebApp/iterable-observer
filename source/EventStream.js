const _private_ = new WeakMap();


/**
 * A simplified implement of `Observable()`
 *
 * @see https://tc39.github.io/proposal-observable/
 */
export default  class EventStream {
    /**
     * @param {EmitterWrapper} listener
     */
    constructor(listener) {

        const that = { };

        _private_.set(this, that);

        that.boot = that.done = false;

        that.listener = listener;

        that.canceller = that.resolve = that.reject = null;

        that.next = value => that.resolve( value );

        that.fail = error => (that.reject( error ), that.done = true);
    }

    listen() {

        const that = _private_.get( this );

        if ( that.boot )  return;

        try {
            that.canceller = that.listener.call(null,  that.next,  async value => {

                that.next( value ),  that.done = true;

                await Promise.resolve();

                try {
                    that.canceller.call( null );

                } catch (error) {  that.fail( error );  }

            },  that.fail);

        } catch (error) {  that.fail( error );  }

        that.boot = true;
    }

    async *[Symbol.asyncIterator]() {

        const that = _private_.get( this );

        while (! that.done)
            yield await new Promise((resolve, reject)  =>  (
                that.resolve = resolve, that.reject = reject, this.listen()
            ));
    }

    /**
     * @return {*} Final value
     */
    async toPromise() {

        var iterator = this[ Symbol.asyncIterator ](), value;

        while ( true ) {

            let result = await iterator.next();

            if ( result.done )  break;

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
