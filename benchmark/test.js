const async_hooks = require('async_hooks');

const CLS = require('../dist/cls/cls').default;
const cls = new CLS();

const ALS = require('../dist/als/als').default;
const als = new ALS();

const clshooked = require('./cls/cls-hooked').createNamespace;
const ns = clshooked('here');

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
async function t2() {
  await sleep(200);
  console.log(cls.get('value'), 'need to be 2');
}
// For CLS-HOOKED
// ns.run(() => {
//   // console.log(process.namespace);
//   console.log(ns.get('value'), 'undefined');
//   ns.set('value', 0);
//   console.log(ns.get('value'), '00');
//   // console.log(process.namespace);
//   ns.run(() => {
//     console.log(ns.get('value'), 'undefined');
//     ns.set('value', 1);
//     ns.set('hehe', 1);
//     console.log(ns.get('value'), 1);
//     process.nextTick(() => {
//       console.log(ns.get('value'), 1);
//       ns.run(async () => {
//         console.log(ns.get('value'), 'undefined');
//         ns.set('value', 2);
//         Promise.resolve('www.google.com').then((res) => {
//           // console.log('inner run id', async_hooks.executionAsyncId());
//           // console.log('inner run', ns._contexts);
//           console.log(ns.get('value'), 'need to be 2');
//         });
//         await t2();
//         console.log(ns.get('value'), 2);
//       });
//       console.log(ns.get('value'), 1);
//     });
//     console.log(ns.get('value'), 'should be 1');
//   });
//   console.log(ns.get('value'), 'should be 0');
//   // console.log(process.namespace);
// });

cls.run({}, () => {
  console.log(cls.get('value'), 'undefined');
  cls.set('value', 1);
  cls.set('hehe', 1);
  console.log(cls.get('value'), 1);
  process.nextTick(() => {
    console.log(cls.get('value'), 1);
    cls.run({}, () => {
      console.log(cls.get('value'), 'undefined');
      cls.set('value', 2);
      Promise.resolve('www.google.com').then((res) => {
        // console.log('inner run id', async_hooks.executionAsyncId());
        // console.log('inner run', cls._contexts);
        console.log(cls.get('value'), 'need to be 2');
      });
      t2();
      console.log(cls.get('value'), 2);
    });
    console.log(cls.get('value'), 1);
  });
  console.log(cls.get('value'), 'should be 1');
});

// cls.run({}, () => {
//   console.log('before set');
//   cls.set('value', 1);
//   console.log('after set');
//   process.nextTick(() => {
//     console.log('herererer');
//     console.log(cls.get('value'), 1);
//   });
// });

// async function t1() {
//   for (let i = 0; i < 200000; i++) {
//     cls.run({}, async () => {
//       cls.set(Math.random(), Date.now());
//     });
//   }
// }
// t1();

// async function t2() {
//   await sleep(1000);
//   for (let i = 0; i < 100000; i++) {
//     cls.run({}, async () => {
//       cls.set(Math.random(), Date.now());
//     });
//   }
// }
// t2();

// const a = Symbol('abc');
// const b = Symbol('abc');
// const x = {};
// console.log(x);
// x[a] = '123';
// console.log(x[a]);
// x[b] = '456';
// console.log(x[b]);

// als.run({}, () => {
//   console.log(als.get('value'), 'undefined');
//   als.set('value', 0);
//   console.log(als.get('value'), '00');
//   als.run({}, () => {
//     console.log(als.get('value'), 'undefined');
//     als.set('value', 1);
//     console.log(als.get('value'), 1);
//   });
//   console.log(als.get('value'), '01');
// });
