# Iterable Observer

[Observable Proposal][1] implement based on [Async Generator (ES 2018)][2] & [TypeScript][3]

[![Build Status](https://travis-ci.com/EasyWebApp/iterable-observer.svg?branch=master)][4]
[![](https://data.jsdelivr.com/v1/package/npm/iterable-observer/badge?style=rounded)][5]

[![NPM](https://nodei.co/npm/iterable-observer.png?downloads=true&downloadRank=true&stars=true)][6]

## Usage

### Basic

```javascript
import { Observable } from 'iterable-observer';

var count = 0,
    list = [];

const observable = new Observable(({ next, complete }) => {
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

### Enhance Run-time platforms

```javascript
import { Observable } from 'iterable-observer';

const reader = new FileReader(),
    {
        files: [file]
    } = document.querySelector('input[type="file"]');

reader.readAsBlob(file);

(async () => {
    for await (const { loaded } of Observable.fromEvent(reader, 'progress'))
        console.log((loaded / file.size) * 100 + '%');
})();
```

[1]: https://github.com/tc39/proposal-observable
[2]: https://tc39.es/ecma262/#sec-asyncgeneratorfunction-objects
[3]: https://www.typescriptlang.org/
[4]: https://travis-ci.com/EasyWebApp/iterable-observer
[5]: https://www.jsdelivr.com/package/npm/iterable-observer
[6]: https://nodei.co/npm/iterable-observer/
