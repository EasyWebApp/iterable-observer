export interface Defer<T = any> {
    promise: Promise<T>;
    resolve: (data?: T) => void;
    reject: (error: Error | string) => void;
}

export function makeDefer<T>(): Defer<T> {
    var resolve: Defer<T>['resolve'], reject: Defer<T>['reject'];

    const promise = new Promise<T>(
        (done, error) => ((resolve = done), (reject = error))
    );

    return { resolve, reject, promise };
}

export type EventHandler = (data: any) => void;

export interface EventTrigger {
    addEventListener?(name: string, handler: EventHandler): void;
    removeEventListener?(name: string, handler: EventHandler): void;
    on?(name: string, handler: EventHandler): this;
    off?(name: string, handler: EventHandler): this;
}
