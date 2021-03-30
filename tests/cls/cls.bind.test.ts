const CLS = require('../../dist/cls/cls').default;
const { AsyncResource } = require('async_hooks');

describe('CLS bind & bindEmitter tests', () => {
  let store;
  beforeEach(() => {
    store = new CLS();
  });

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
});
