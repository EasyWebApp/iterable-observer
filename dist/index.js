import Observable from './Observable';

/**
 * HTTP request
 *
 * @param {string|URL} URL
 * @param {string}     [method='GET']
 * @param {?*}         data           - Data to send
 * @param {string}     [type='text']  - [Response type](https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/responseType)
 *
 * @return {Observable}
 */
export default function (URL, method, data, type) {

    return new Observable((next, done) => {

        const XHR = new XMLHttpRequest();

        XHR.upload.onloadend = XHR.upload.onprogress = event => next({
            loaded: event.loaded,
            total: event.total
        });

        XHR.onload = () => done(XHR.response);

        XHR.open(method || 'GET', URL);

        XHR.responseType = type || 'text';

        XHR.send(data);
    });
}