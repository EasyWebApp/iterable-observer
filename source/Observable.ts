import { Defer, makeDefer } from './utility';

export interface Observer<T = any> {
    next(value: T): void;
    error(reason: string | Error): void;
    complete(): void;
}

export type SubscriberFunction = (observer: Observer) => (() => void) | void;

export class Observable<T = any> {
    private subscriber: SubscriberFunction;

    constructor(subscriber: SubscriberFunction) {
        this.subscriber = subscriber;
    }

    async *[Symbol.asyncIterator]() {
        var queue: Defer<T>[] = [makeDefer<T>()],
            canceler: (() => void) | void,
            done = false;

        const observer: Observer<T> = {
            next(value) {
                if (done) return;

                queue[queue.length - 1].resolve(value);

                queue.push(makeDefer());
            },
            error(reason) {
                if (!done)
                    queue[queue.length - 1].reject(reason), (done = true);

                if (canceler) canceler();
            },
            complete() {
                if (!done) queue[queue.length - 1].resolve(), (done = true);

                if (canceler) canceler();
            }
        };

        canceler = this.subscriber(observer);

        do {
            yield queue[0].promise;

            queue.shift();
        } while (queue[0] || !done);
    }

    static of<T = any>(...items: T[]) {
        return new this<T>(({ next, complete }) => {
            for (const item of items) next(item);

            complete();
        });
    }

    subscribe(
        onNext: Observer<T>['next'],
        onError?: Observer<T>['error'],
        onComplete?: Observer<T>['complete']
    ) {
        var stop = false;

        (async () => {
            try {
                for await (const item of this)
                    if (!stop) onNext(item);
                    else break;

                if (onComplete instanceof Function) onComplete();
            } catch (error) {
                if (onError instanceof Function) onError(error);
            }
        })();

        return {
            unsubscribe() {
                stop = true;
            },
            get closed() {
                return stop;
            }
        };
    }

    static from<T = any>(observable: Observable<T>) {
        return new this<T>(
            ({ next, error, complete }) =>
                observable.subscribe(next, error, complete).unsubscribe
        );
    }
}
