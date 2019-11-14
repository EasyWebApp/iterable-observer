import { Defer, makeDefer } from './utility';

export interface Observer {
    next(value: any): void;
    error(reason: string | Error): void;
    complete(value: any): void;
}

export type SubscriberFunction = (observer: Observer) => () => void;

export default class Observable {
    private subscriber: SubscriberFunction;

    constructor(subscriber: SubscriberFunction) {
        this.subscriber = subscriber;
    }

    async *[Symbol.asyncIterator]() {
        var queue: Defer[] = [makeDefer()],
            cursor = 0,
            canceler: () => void,
            done = false;

        const observer: Observer = {
            next(value) {
                if (done) return;

                queue[cursor++].resolve(value);

                queue.push(makeDefer());
            },
            error(reason) {
                if (done) return;

                queue[cursor].reject(reason), (done = true);

                if (canceler) canceler();
            },
            complete(value) {
                if (done) return;

                queue[cursor++].resolve(value), (done = true);

                if (canceler) canceler();
            }
        };

        canceler = this.subscriber(observer);

        while (true) {
            if (!done) yield queue[0].promise;
            else return queue[0].promise;

            queue.shift(), cursor--;
        }
    }
}
