import { Defer, makeDefer } from './utility';

export interface Observer<T = any> {
    next(value: T): void;
    error(reason: string | Error): void;
    complete(value: T): void;
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
                if (done) return;

                queue[queue.length - 1].reject(reason), (done = true);

                if (canceler) canceler();
            },
            complete(value) {
                if (done) return;

                queue[queue.length - 1].resolve(value), (done = true);

                if (canceler) canceler();
            }
        };

        canceler = this.subscriber(observer);

        while (true) {
            yield queue[0].promise;

            queue.shift();

            if (done) break;
        }
    }
}
