const _queue_ = new WeakMap();


export default  class Observable {
    /**
     * @param {EmitterWrapper} emitter
     */
    constructor(emitter) {

        const queue = [ ];

        _queue_.set(this, queue);

        var next;

        const wait = () =>
            queue.push(new Promise(resolve => next = resolve));

        wait();

        this.done = false;

        emitter(
            value => (next(value), wait()),
            value => (next(value), this.done = true)
        );
    }

    async *[Symbol.asyncIterator]() {

        const queue = _queue_.get( this );

        for (let i = 0;  ! this.done;  i++)  yield await queue[i];
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
 * @param {function} next
 * @param {function} done
 */
