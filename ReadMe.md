# Iterable Observer

[Observable Proposal][1] implement based on [Async Generator (ES 2018)][2] & [TypeScript][3]

[![NPM Dependency](https://img.shields.io/librariesio/github/EasyWebApp/iterable-observer.svg)][4]
[![CI & CD](https://github.com/EasyWebApp/iterable-observer/actions/workflows/main.yml/badge.svg)][5]
[![](https://data.jsdelivr.com/v1/package/npm/iterable-observer/badge?style=rounded)][6]

[![NPM](https://nodei.co/npm/iterable-observer.png?downloads=true&downloadRank=true&stars=true)][7]

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

#### Transform events

```javascript
import { Observable } from 'iterable-observer';

const reader = new FileReader(),
    { files } = document.querySelector('input[type="file"]');

reader.readAsBlob(files[0]);

(async () => {
    for await (const { loaded } of Observable.fromEvent(reader, 'progress'))
        console.log((loaded / file.size) * 100 + '%');
})();
```

#### Transform streams

```typescript
import { Observable } from 'iterable-observer';

(async () => {
    const { body } = await fetch('https://example.com/path/to/blob'),
        chunks: Uint8Array[] = [];

    for await (const chunk of Observable.fromStream(body)) chunks.push(chunk);

    const blob = new Blob(chunks);

    console.log(blob);
}();
```

### Concurrent Task to Serial Queue

```javascript
import { createQueue } from 'iterable-observer';
import Koa from 'koa';
import BodyParser from 'koa-bodyparser';

const { process, observable } = createQueue(),
    app = new Koa();

(async () => {
    for await (const { defer, data } of observable)
        defer.resolve(JSON.stringify(data));
})();

app.use(BodyParser)
    .use(async context => (context.body = await process(context.request.body)))
    .listen(80);
```

[1]: https://github.com/tc39/proposal-observable
[2]: https://tc39.es/ecma262/#sec-asyncgeneratorfunction-objects
[3]: https://www.typescriptlang.org/
[4]: https://libraries.io/npm/iterable-observer
[5]: https://github.com/EasyWebApp/iterable-observer/actions/workflows/main.yml
[6]: https://www.jsdelivr.com/package/npm/iterable-observer
[7]: https://nodei.co/npm/iterable-observer/
