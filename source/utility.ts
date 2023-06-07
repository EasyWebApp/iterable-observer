export class Defer<T = any> {
    resolve: (data?: T) => void;
    reject: (error: Error | string) => void;

    promise = new Promise<T>((resolve, reject) => {
        this.resolve = resolve;
        this.reject = reject;
    });
}

/**
 * @deprecated use `new Defer()` directly, since v1.0.0.
 */
export const makeDefer = <T>() => new Defer<T>();

export type EventHandler = (data: any) => void;

export interface EventTrigger {
    addEventListener?(name: string, handler: EventHandler): void;
    removeEventListener?(name: string, handler: EventHandler): void;
    on?(name: string, handler: EventHandler): this;
    off?(name: string, handler: EventHandler): this;
}
