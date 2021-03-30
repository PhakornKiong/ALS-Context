const ALS = require('alscontext').default;
const { AsyncResource } = require('async_hooks');
const store = new ALS();

let asyncResource1;
let asyncResource2;
let someOtherFunc;
const otherFunc = () => {
  return store.get('test');
};
store.run({ test: 1 }, () => {
  asyncResource1 = new AsyncResource('a');
  store.run({ test: 2 }, () => {
    asyncResource2 = new AsyncResource('b');
    someOtherFunc = () => {
      store.get('test');
    };
  });
});
const bindedFunc1 = store.bindEmitter(asyncResource1, otherFunc);
const bindedFunc2 = store.bindEmitter(asyncResource2, otherFunc);
bindedFunc1(); // return 1
bindedFunc2(); // return 2
otherFunc(); // return undefined
