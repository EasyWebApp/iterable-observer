import { Defer, makeDefer, EventTrigger } from './utility';

declare global {
    interface SymbolConstructor {
        readonly observable: unique symbol;
    }
}

if (!Symbol.observable) Reflect.set(Symbol, 'observable', Symbol('observable'));

export interface Observer<T = any> {
    next(value: T): void;
    error(reason: string | Error): void;
    complete(): void;
}

export interface Subscription {
    unsubscribe(): void;
    readonly closed: boolean;
}

export interface Subscribable<T = any> {
    [Symbol.observable](): Subscribable<T>;
    subscribe(
        onNext: Observer<T>['next'],
        onError?: Observer<T>['error'],
        onComplete?: Observer<T>['complete']
    ): Subscription;
}

export type SubscriberFunction<T = any> = (
    observer: Observer<T>
) => (() => void) | void;

export class Observable<T = any> implements Subscribable {
    private subscriber: SubscriberFunction<T>;

    constructor(subscriber: SubscriberFunction<T>) {
        this.subscriber = subscriber;
    }

    [Symbol.observable]() {
        return this;
    }

    async *[Symbol.asyncIterator]() {
        var queue: Defer<T>[] = [new Defer<T>()],
            canceler: (() => void) | void,
            done = false;

        const observer: Observer<T> = {
            next(value) {
                if (done) return;

                queue[queue.length - 1].resolve(value);

                queue.push(new Defer<T>());
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
        } while (queue[0]);
    }

    static of<T = any>(...items: T[]) {
        return new this<T>(({ next, complete }) => {
            for (const item of items) next(item);

            complete();
        });
    }

    async toPromise() {
        const stack = [];

        for await (const item of this) {
            stack.push(item);

            if (stack.length > 2) stack.shift();
        }

        return stack[0];
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

    static from<T = any>(observable: Subscribable<T>) {
        return new this<T>(
            ({ next, error, complete }) =>
                observable.subscribe(next, error, complete).unsubscribe
        );
    }

    static fromEvent<T = any>(target: EventTrigger, name: string) {
        return new this<T>(({ next, error }) => {
            if (typeof target.on === 'function')
                target.on(name, next).on('error', error);
            else {
                target.addEventListener(name, next);
                target.addEventListener('error', error);
            }

            return () => {
                if (typeof target.off === 'function')
                    target.off(name, next).off('error', error);
                else {
                    target.removeEventListener(name, next);
                    target.removeEventListener('error', error);
                }
            };
        });
    }
}
