const CLS = require('../dist/cls/cls').default;
const cls = new CLS();

const ALS = require('../dist/als/als').default;
const als = new ALS();
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
async function t2() {
  await sleep(200);
  console.log(cls.get('value'), 'need to be 2');
}

cls.run({}, () => {
  // console.log(process.namespace);
  console.log(cls.get('value'), 'undefined');
  cls.set('value', 0);
  console.log(cls.get('value'), '00');
  // console.log(process.namespace);
  cls.run({}, () => {
    console.log('start inner Loop');
    console.log(cls.get('value'), 'undefined');
    cls.set('value', 1);
    cls.set('hehe', 1);
    console.log(cls.get('value'), 1);
    console.log('end inner Loop');
    process.nextTick(() => {
      console.log(cls.get('value'), 1);
      cls.run({}, () => {
        console.log(cls.get('value'), 'undefined');
        cls.set('value', 2);
        Promise.resolve('www.google.com').then((res) => {
          console.log(cls.get('value'), 'need to be 2');
        });
        t2();
        console.log(cls.get('value'), 2);
      });
      console.log(cls.get('value'), 1);
      console.log('after loop');
    });
    console.log(cls.get('value'), 'should be 1');
  });
  console.log(cls.get('value'), 'should be 0');
  // console.log(process.namespace);
});

// cls.run({}, () => {
//   cls.set('value', 1);
//   process.nextTick(() => {
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
