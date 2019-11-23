import { Observable, Observer } from '../source';

describe('Observable', () => {
    var observable: Observable, timer: any;

    const cleaner = jest.fn(() => clearInterval(timer));

    it('should not call Subscriber Function while constructing', () => {
        var count = 0;

        const subscriber = jest.fn(({ next, complete }: Observer) => {
            timer = setInterval(
                () => (++count < 5 ? next(count) : complete(count)),
                0
            );

            return cleaner;
        });

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
