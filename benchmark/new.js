const net = require('net');
const { AsyncResource } = require('async_hooks');
const ALS = require('../dist/als/als').default;
als = new ALS();

let testValue1;
let testValue2;
let testValue3;
let testValue4;

let serverDone = false;
let clientDone = false;
let x;
let y;
let z;
let zz;
let h = () => {
  console.log(als.get('test'));
};
als.run({}, () => {
  als.set('test', 'originalValue');
  x = als.bind(() => {
    console.log(als.get('test'));
  }, 'hello');
  als.run({}, () => {
    als.set('test', 'next value');
    y = als.bind(() => {
      console.log(als.get('test'));
    }, 'hello');
    z = () => {
      console.log(als.get('test'));
    };
    zz = als.bind(h);
  });
});
x();
y();
z();
h();
zz();
