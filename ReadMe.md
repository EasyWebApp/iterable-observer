# WaterWheel

[Observable Proposal][1] implement based on [Async Generator (ES 2018)][2] & [TypeScript][3]

## Usage

```javascript
import { Observable } from 'waterwheel';

var count = 0,
    list = [];

const observable = new Observable(({ next, complete }: Observer) => {
    const timer = setInterval(
        () => (++count < 5 ? next(count) : complete(count)),
        0
    );

    return () => clearInterval(timer);
});

(async () => {
    for await (const item of observable) list.push(item);

    console.log(list); // [1, 2, 3, 4, 5]
})();
```

[1]: https://github.com/tc39/proposal-observable
[2]: https://tc39.es/ecma262/#sec-asyncgeneratorfunction-objects
[3]: https://www.typescriptlang.org/
