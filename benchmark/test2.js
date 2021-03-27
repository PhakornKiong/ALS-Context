const CLS = require('../dist/cls/cls').default;
const cls = new CLS();
const ALS = require('../dist/als/als').default;
const async_hooks = require('async_hooks');
// let store1 = new ALS();
// let store2 = new ALS();
let store1 = new CLS();
let store2 = new CLS();
let test1Val;
let test2Val;
let test3Val;
let test4Val;
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
store1.run({}, () => {
  store2.run({}, () => {
    store1.set('name', 'store1');
    store2.set('name', 'store2');

    setTimeout(() => {
      store1.run({}, () => {
        // console.log(async_hooks.executionAsyncId());
        // console.log(store2);
        // console.log(store2.getStore());

        process.nextTick(() => {
          // console.log(async_hooks.executionAsyncId());
          store1.set('name', 'bob');
          store2.set('name', 'alice');
          test3Val = store1.get('name');
          test4Val = store2.get('name');
          console.log(test3Val);
          console.log(test4Val);
        });
      });
    });
    process.nextTick(() => {
      test1Val = store1.get('name');
      test2Val = store2.get('name');
      console.log(test1Val);
      console.log(test2Val);
    });
  });
});
