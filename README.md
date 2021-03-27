# ALSContext
Continuation-local storage using Node.js AsyncLocalStorage with fallback to a modified implementation of cls-hooked.

When running Nodejs version 8.12.0 to version before (`12.17.0` or `13.10.0`), this module uses [Async-Hook](https://nodejs.org/docs/latest-v8.x/api/async_hooks.html) API from node.js inspired from [cls-hooked](https://github.com/Jeff-Lewis/cls-hooked). 

This module aims to provide a consistent API to user of Nodejs before introduction of [AsyncLocalStorage](https://nodejs.org/api/async_hooks.html#async_hooks_class_asynclocalstorage) which is available in Nodejs from version `12.17.0` or `13.10.0` onwards.

Continuation-local storage works like thread-local storage in threaded programming, but is based on chains of Node-style callbacks instead of threads.
The standard Node convention of functions calling functions is very similar to something called ["continuation-passing style"][cps] in functional programming,
and the name comes from the way this module allows you to set and get values that are scoped to the lifetime of these chains of function calls.

Calls to `.run()` can be nested, and each nested context this creates its own context (*Here is the difference to `cls-hook`*). When a function is making multiple asynchronous calls, this allows each child call to get, set, and pass along its own context without overwriting the parent's.

A simple, annotated example of how this nesting behaves:

```Javascript
// const ALS = require('alscontext').default;
import ALS from 'alscontext';
const store = new ALS();

store.run({}, () => {
  // store.get('value') return undefined
  store.set('value', 0);
  // store.get('value') return 0
  requestHandler();
});

function requestHandler() {
  store.run({}, () => {
    // store.get('value') return undefined
    store.set('value', 1);
    // store.get('value') return 1
    process.nextTick(() => {
      // store.get('value') return 1
      store.run({}, () => {
        // store.get('value') return undefined
        store.set('value', 2);
        // store.get('value') return 2
      });
      // store.get('value') return 1
    });
  });

  setTimeout(function () {
    // store.get('value') return 0
  }, 1000);
}

```

# API Reference

## CLASS: ALS<T>

## als.run<R>(defaults: Record<string, any>, callback: (...args: any[]) => R, ...args: any[]): R

***Parameters***

- ***defaults***: Optional `Map` or `Record` containing default values for the context
- ***callback***: Function that will be the boundary of the said context, anything set to be run from within the callback will have the same context
- ***...args:*** Option arguments to be passed to `callback`

***Return***

- Return the return value from ***callback***

  

## als.get(key: string): T | undefined 

***Parameters***

- ***key***: a string key to retrieve the stored value in context

***Return***

- Return the stored value in context or undefined

  

## als.set(key: string, value: T): void

***Parameters***

- ***key***: a string key to store value in context

- ***value***: any value to be stored under the key for lookup

  

## als.get(): StorageType | undefined 

***Return***

- Return the entire context in `Map` object or undefined (if it is called outside `als.run`)

  

## als.bind( fn:(...args: any[]) => any, ...args:any[] ): any

***Parameters***

- ***fn***: Function to be bind to the current execution context
- ***...args***: Option arguments to be passed to `fn`

***Return***

- Return the return value of `fn`

  

## als.bindEmitter( asyncResource: AsyncResource, fn:(...args: any[]) => any, ...args:any[]  ): any

***Parameters***

- ***asyncResource***: AsyncResource object from Nodejs (const asyncResource = new AsyncResource)
- ***fn***: Function to be bind to that `asyncResource` execution context
- ***...args***: Option arguments to be passed to `fn`

***Return***

- Return the return value of `fn`

