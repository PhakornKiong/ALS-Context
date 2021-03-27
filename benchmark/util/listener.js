// https://github.com/othiym23/node-continuation-local-storage/issues/64
const CLS = require('../../dist/cls2/cls').default;
const cls = new CLS();
const clshooked = require('cls-hooked').createNamespace;
const ns = clshooked('here');
const ALS = require('../../dist/als/als').default;
const als = new ALS();

var promise;
als.run({}, function () {
  als.set('test', 2);
  promise = new Promise(function (resolve) {
    als.run({}, function () {
      als.set('test', 1);
      resolve();
    });
  });
});

als.run({}, function () {
  als.set('test', 3);
  promise.then(function () {
    console.log('ALS follow implementation follows convention ' + als.get('test'));
  });
});

var promise;
cls.run({}, function () {
  cls.set('test', 2);
  promise = new Promise(function (resolve) {
    cls.run({}, function () {
      cls.set('test', 1);
      resolve();
    });
  });
});

cls.run({}, function () {
  cls.set('test', 3);
  promise.then(function () {
    console.log('CLS follow implementation follows convention ' + cls.get('test'));
  });
});

var promise;
ns.run(function () {
  ns.set('test', 2);
  promise = new Promise(function (resolve) {
    ns.run(function () {
      ns.set('test', 1);
      resolve();
    });
  });
});

ns.run(function () {
  ns.set('test', 3);
  promise.then(function () {
    console.log('CLS-hooked follow implementation convention ' + ns.get('test'));
  });
});
