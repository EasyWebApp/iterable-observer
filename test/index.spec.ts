import { Observable, Observer, createQueue } from '../source';
import { EventEmitter } from 'events';

function createExample() {
    var timer: any,
        count = 0;

    const cleaner = jest.fn(() => clearInterval(timer));

    const subscriber = jest.fn(({ next, complete }: Observer) => {
        timer = setInterval(() => (++count < 6 ? next(count) : complete()), 0);

        return cleaner;
    });

    return { subscriber, cleaner };
}

describe('Observable', () => {
    describe('Single', () => {
        const { subscriber, cleaner } = createExample();
        var observable: Observable;

        it('should not call Subscriber Function while constructing', () => {
            observable = new Observable<number>(subscriber);

            expect(subscriber).toBeCalledTimes(0);
        });

        it('should iterate Limited items asynchronously', async () => {
            const list = [];

            for await (const item of observable) list.push(item);

            expect(list).toEqual(expect.arrayContaining([1, 2, 3, 4, 5]));

            expect(cleaner).toBeCalledTimes(1);
        });

        it('should throw Error after error() called', () => {
            const observable = new Observable(({ error }) => {
                error(new Error('test'));
            });

            expect(
                (async () => {
                    for await (const item of observable);
                })()
            ).rejects.toStrictEqual(new Error('test'));
        });
    });

    describe('Pipe', () => {
        it('should construct an Observable from Static data', async () => {
            const observable = Observable.of<number>(1, 2, 3),
                list = [];

            for await (const item of observable) list.push(item);

            expect(list).toEqual(expect.arrayContaining([1, 2, 3]));
        });

        it('should convert to a Promise', () => {
            const observable = Observable.of<number>(1, 2, 3);

            expect(observable.toPromise()).resolves.toBe(3);
        });

        it('should invoke handlers after subscribing', async () => {
            const { subscriber, cleaner } = createExample();

            const observable = new Observable<number>(subscriber),
                onNext = jest.fn();

            await new Promise<void>(resolve =>
                observable.subscribe(onNext, null, resolve)
            );

            expect(onNext).toHaveBeenNthCalledWith(1, 1);
            expect(onNext).toHaveBeenNthCalledWith(2, 2);
            expect(onNext).toHaveBeenNthCalledWith(3, 3);
            expect(onNext).toHaveBeenNthCalledWith(4, 4);
            expect(onNext).toHaveBeenNthCalledWith(5, 5);

            expect(cleaner).toBeCalledTimes(1);
        });

        it('should construct an Observable from an exist Observable', async () => {
            const { subscriber } = createExample();

            const old = new Observable<number>(subscriber);

            const observable = Observable.from<number>(old),
                list = [];

            for await (const item of observable) list.push(item);

            expect(list).toEqual(expect.arrayContaining([1, 2, 3, 4, 5]));
        });
    });

    describe('3th Party Platform interfaces', () => {
        it('should listen Event Emitters', async () => {
            const target = new EventEmitter();
            var count = 0;

            const observable = Observable.fromEvent(target, 'test'),
                list = [];

            const timer = setInterval(() => {
                if (++count < 4) target.emit('test', count);
                else {
                    clearInterval(timer);
                    target.emit('error', 'example');
                }
            }, 0);

            try {
                for await (const item of observable) list.push(item);
            } catch (error) {
                expect(list).toEqual(expect.arrayContaining([1, 2, 3]));
                expect(error).toBe('example');
            }
        });
    });

    describe('Async Queue', () => {
        it('should process Data serially', async () => {
            const { process, destroy, observable } = createQueue(),
                list = [];
            var count = 0;

            setTimeout(function tick() {
                process(count++).then(number => list.push(number));

                if (count < 5) setTimeout(tick, 0);
                else destroy();
            }, 0);

            for await (const item of observable)
                if (item) {
                    let {
                        defer: { resolve },
                        data
                    } = item;

                    resolve(++data);
                }

            expect(list).toEqual(expect.arrayContaining([1, 2, 3, 4, 5]));
        });
    });
});
