const async_hooks = require('async_hooks');
// const v8 = require('v8');
const CLS = require('../dist/cls/cls').default;
const cls = new CLS();

// const ALS = require('../dist/als/als').default;
// const als = new ALS();

const store = new CLS();

const clshooked = require('cls-hooked').createNamespace;
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
//   cls.set('value', 1);
//   console.log(cls.get('value'), 1);
// });

// cls.run({}, () => {
//   console.log('before set');
//   cls.set('value', 1);
//   console.log('after set');
//   process.nextTick(() => {
//     console.log('herererer');
//     console.log(cls.get('value'), 1);
//   });
// });
// Object.size = function (obj) {
//   var size = 0,
//     key;
//   for (key in obj) {
//     if (obj.hasOwnProperty(key)) size++;
//   }
//   return size;
// };

// async function t1() {
//   for (let i = 0; i < 200000; i++) {
//     ns.run(async () => {
//       ns.set('hello', Date.now());
//       if (i === 199999) {
//         console.log(Object.size(ns._contexts));
//       }
//     });
//   }
// }
// console.log('here');
// t1();

// async function t2() {
//   await sleep(3000);
//   for (let i = 0; i < 100000; i++) {
//     ns.run(async () => {
//       ns.set(Math.random(), Date.now());
//     });
//   }
// }
// t2();

// for CLS or ALS
// function t1() {
//   for (let i = 0; i < 200000; i++) {
//     store.run({}, async () => {
//       store.set('hello', 'there');
//       if (i === 19) {
//         console.log(store.active);
//         console.log(store._contexts);
//       }
//     });
//   }
// }
// console.log('here');
// t1();

// async function t2() {
//   await sleep(3000);
//   for (let i = 0; i < 100000; i++) {
//     store.run({}, async () => {
//       store.set(Math.random(), Date.now());
//     });
//   }
//   if ((i = 99999)) {
//   }
// }
// t2();

// async function t3() {
//   await sleep(500);
//   console.log(store.active);
//   console.log(store._contexts);
//   await sleep(500);
//   console.log(store.active);
//   console.log(store._contexts.size);
//   await sleep(500);
//   console.log(store.active);
//   console.log(store._contexts.size);
//   await sleep(3000);
//   console.log(store.active);
//   console.log(store._contexts.size);
// }
// t3();

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
