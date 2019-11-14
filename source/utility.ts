export interface Defer<T = any> {
    promise: Promise<T>;
    resolve: (data: any) => void;
    reject: (error: Error | string) => void;
}

export function makeDefer<T>(): Defer<T> {
    var resolve: Defer<T>['resolve'], reject: Defer<T>['reject'];

    const promise = new Promise<T>(
        (done, error) => ((resolve = done), (reject = error))
    );

    return { resolve, reject, promise };
}
