const CLS = require('../dist/cls/cls').default;
const async_hooks = require('async_hooks');
const store = new CLS();
const data = new Map().set('result', Symbol('verifier'));

const then = (success) => {
  console.log(async_hooks.executionAsyncResource());
  console.log(store.get('result'));
  success();
};
const thenable = {
  then,
};

const t1 = () => {
  store.run(data, async () => {
    console.log(store.get('result'));
    Promise.resolve().then(() => thenable);
    Promise.resolve().then(() => thenable);
    // Promise.resolve().then(() => {
    //   console.log(store.get('result'));
    // });
  });
};

t1();
