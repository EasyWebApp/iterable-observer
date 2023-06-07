import { Observable, Observer } from './Observable';
import { Defer } from './utility';

export function createQueue<D = any>() {
    type Data = { defer: Defer; data: D };

    var feedNext: Observer<Data>['next'], stop: Observer<Data>['complete'];

    const observable = new Observable<Data>(({ next, complete }) => {
        (feedNext = next), (stop = complete);
    });

    return {
        process<R = any>(data: D) {
            const defer = new Defer<R>();

            if (!feedNext)
                throw Error("Can't process data before Queue consuming");

            feedNext({ defer, data });

            return defer.promise;
        },
        destroy() {
            if (!stop) throw Error("Can't stop a Queue before Queue consuming");

            stop();
        },
        observable
    };
}
