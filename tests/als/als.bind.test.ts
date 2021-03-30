const ALS = require('../../dist/als/als').default;
import { isAlsSupported, getNodeVersion, nodeVersionString } from '../../dist/utils/nodeVersion';
const { AsyncResource } = require('async_hooks');

describe('ALS bind & bindEmitter tests', () => {
  let store;
  beforeEach(() => {
    store = new ALS();
  });
  if (isAlsSupported(getNodeVersion(nodeVersionString))) {
    describe('Test ASL.bind works', () => {
      test('Function can access the context inside run after bind', () => {
        let bindedFunc;
        const someFunc = () => {
          return store.get('test');
        };
        store.run({ test: 'something' }, () => {
          bindedFunc = store.bind(someFunc);
        });

        expect(bindedFunc()).toEqual('something');
        expect(someFunc()).toBeUndefined();
      });
    });
    describe('Test ASL.bindEmitter works', () => {
      test('Function can access the context where asyncResource is declared  after bindEmitter', () => {
        let asyncResource1;
        let asyncResource2;
        const someFunc = () => {
          return store.get('test');
        };
        store.run({ test: 1 }, () => {
          asyncResource1 = new AsyncResource('a');
          store.run({ test: 2 }, () => {
            asyncResource2 = new AsyncResource('b');
          });
        });
        const bindedFunc1 = store.bindEmitter(asyncResource1, someFunc);
        const bindedFunc2 = store.bindEmitter(asyncResource2, someFunc);
        expect(bindedFunc1()).toEqual(1);
        expect(bindedFunc2()).toEqual(2);
        expect(someFunc()).toBeUndefined();
      });
    });
  } else {
    // eslint-disable-next-line jest/expect-expect
    test('dummy test', () => {
      // Avoid Jest Complain
    });
  }
});
