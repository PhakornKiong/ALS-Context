# ALSContext
[![tests](https://github.com/Darkripper214/ALS-Context/actions/workflows/tests.yml/badge.svg)](https://github.com/Darkripper214/ALS-Context/actions/workflows/tests.yml)
[![Coverage Status](https://coveralls.io/repos/github/Darkripper214/ALS-Context/badge.svg?branch=master)](https://coveralls.io/github/Darkripper214/ALS-Context?branch=master)
[![npm version](https://badge.fury.io/js/alscontext.svg)](https://badge.fury.io/js/alscontext)

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

# Install

```bash
$ npm install alscontext
```

# Usage

Importing Module

```javascript
// mjs
import ALS, { CLS } from 'alscontext';

// cjs
const ALS = require('alscontext').default;
const ALS = require('alscontext').ALS;
const CLS = require('alscontext').CLS;

// ALS will automatically determine whether to use node's AsyncLocalStorage or the custom implemented CLS that is consistent with node
// If you want to use CLS, it can be imported as CLS like above
```



As an `Express` middleware

```Javascript
const ALS = require('alscontext').default;
const express = require('express');

const als = new ALS();
const app = express();
const port = 3000;

app.use((req, res, next) => {
  // als.run() creates a new context with a default object here
  als.run({ user: 'John Doe' }, () => {
    // You may do other operation here before passing the the next middleware
    next();
  });
});

app.use((req, res, next) => {
  als.get('user'); // Return "John Doe"
  als.set('user', 'Max'); // Set the "user" key to "Max"
  next();
});

app.get('/', (req, res) => {
  // als.getStore() returns a Map
  res.json({ store: als.getStore() });
});

app.listen(port, () => {
  console.log(`Running on http://localhost:${port}/`);
});

```

While working with `EventEmitter` like `req` or `res` from `Express` like the following, it is best to use `als.bind()` or `als.bindEmitter()` to bind it to the right `async context`. 

```javascript
  req.on(
    'close',
    als.bind(() => {
      console.log(als.getStore()); //returns the store
    })
  );

   req.on('close', () => {
     console.log(als.getStore()); //returns undefined
   });
```

This is because `EventEmitter` is not part of the `asyncResource` and it will run outside the `context`.  [More on the discussion here](https://github.com/nodejs/node/issues/33723)



This module supports having multiple instance nested together, for example:

```javascript
const ALS = require('alscontext').ALS;

const store1 = new ALS();
const store2 = new ALS();

let test1Val;
let test2Val;
let test3Val;
let test4Val;

store1.run({}, () => {
  // Store 1 - outer run starts
  console.log('Store 1 - outer run starts');
  store2.run({}, () => {
    // Store 2 - run starts
    console.log('Store 2 - run starts');
    store1.set('name', 'store1');
    store2.set('name', 'store2');

    setTimeout(() => {
      store1.run({}, () => {
        // Store 1 - inner run starts
        console.log('Store 1 - inner run starts');
        process.nextTick(() => {
          console.log('Store 1 - next Tick starts');
          store1.set('name', 'bob');
          store2.set('name', 'alice');
          setTimeout(() => {
            console.log('Store 1 - timeout starts');
            test3Val = store1.get('name');
            test4Val = store2.get('name');
            console.log(test3Val);
            console.log(test4Val);
            console.log('Store 1 - timeout ends');
          });
          console.log('Store 1 - next Tick ends');
        });
        console.log('Store 1 - inner run ends');
        // Store 1 - inner run ends
      });
    });
    process.nextTick(() => {
      test1Val = store1.get('name');
      test2Val = store2.get('name');
      console.log(test1Val);
      console.log(test2Val);
    });
    console.log('Store 2 - run ends');
    // Store 2 - run ends
  });
  console.log('Store 1 - outer run ends');
  // Store 1 - outer run ends
});

// Take note at the sequence
// Store 1 - outer run starts
// Store 2 - run starts
// Store 2 - run ends
// Store 1 - outer run ends
// store1
// store2
// Store 1 - inner run starts
// Store 1 - inner run ends
// Store 1 - next Tick starts
// Store 1 - next Tick ends
// Store 1 - timeout starts
// bob
// alice
// Store 1 - timeout ends
```



# API Reference

## CLASS: ALS<T>

## als.run<R>(defaults: Record<string, any>, callback: (...args: any[]) => R, ...args: any[]): R

Runs a function synchronously and start the boundary of a context, anything set to be run from within the callback will have the same context.

***Parameters***

- ***defaults***: Optional `Map` or `Record` containing default values for the context
- ***callback***: Function that will be the boundary of the said context, anything set to be run from within the callback will have the same context
- ***...args:*** Option arguments to be passed to `callback`

***Return***

- Return the return value from ***callback***

  

## als.get(key: string): T | undefined 

Get the stored value in context or undefined

***Parameters***

- ***key***: a string key to retrieve the stored value in context

***Return***

- Return the stored value in context or undefined

  

## als.set(key: string, value: T): void

Set key & value to the current context

***Parameters***

- ***key***: a string key to store value in context

- ***value***: any value to be stored under the key for lookup

  

## als.getStore(): StorageType | undefined 

Get the entire context in Map object or undefined

***Return***

- Return the entire context in `Map` object or undefined (if it is called outside `als.run`)



## als.disable(): void

Disable the instance of `als`. All subsequent calls to `als.getStore()` & `als.get()` will return undefined until new context is created using `als.run()`. It is developer’s responsibility to ensure that `als` is disabled so the instance of `als` can be garbage-collected. This does not applies to the `store` or `asyncResource` (Which is used to achieve this functionality) as these objects are garbage collected when the async resources is completed (`after` hook)

Use this method when `als` is no longer in use.



## als.exit( fn:(...args: any[]) => any, ...args:any[] ): any

Runs a function synchronously outside of a context and returns its return value. The store is not accessible within the function or the asynchronous operations created within the function. Any `als.getStore()` or `als.get()` call done within the function will always return `undefined`.

***Parameters***

- ***fn***: Function to be bind to the current execution context
- ***...args***: Option arguments to be passed to `fn`

***Return***

- `fn`'s return value



## als.bind( fn:(...args: any[]) => any, ...args:any[] ): any

Bind a function to the current execution context. This is useful especially when you need to access the context outside of `als.run()` or when dealing when `EventEmitters` 

***Parameters***

- ***fn***: Function to be bind to the current execution context
- ***...args***: Option arguments to be passed to `fn`

***Return***

- `fn`'s return value

```javascript
const ALS = require('alscontext').default;
const store = ALS();

let bindedFunc;
const someFunc = () => {
  return store.get('test');
};
store.run({ test: 'something' }, () => {
  bindedFunc = store.bind(someFunc);
});

bindedFunc(); // return "something" - able to get the context outside of run
someFunc(); // return undefined
```



## als.bindEmitter( asyncResource: AsyncResource, fn:(...args: any[]) => any, ...args:any[]  ): any

An extension to the `als.bind` which allow developers to specify the execution context to be bind to the function. This is useful especially when you need to access the context outside of `als.run()` or when dealing when `EventEmitters` 

***Parameters***

- ***asyncResource***: AsyncResource object from Nodejs (const asyncResource = new AsyncResource)
- ***fn***: Function to be bind to that `asyncResource` execution context
- ***...args***: Option arguments to be passed to `fn`

***Return***

- `fn`'s return value

```javascript
const ALS = require('alscontext').default;
const { AsyncResource } = require('async_hooks');
const store = ALS();

let asyncResource1;
let asyncResource2;
const otherFunc = () => {
  return store.get('test');
};
store.run({ test: 1 }, () => {
  asyncResource1 = new AsyncResource('a');
  store.run({ test: 2 }, () => {
    asyncResource2 = new AsyncResource('b');
  });
});
const bindedFunc1 = store.bindEmitter(asyncResource1, otherFunc);
const bindedFunc2 = store.bindEmitter(asyncResource2, otherFunc);
bindedFunc1(); // return 1 - the context for the outer run
bindedFunc2(); // return 2 - the context for the inner run
otherFunc(); // return undefined

```
