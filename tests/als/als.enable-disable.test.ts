const ALS = require('../../dist/als/als').default;

describe('ALS enable and disable tests', () => {
  test('Nesting of disable and exit should work as intended', () => {
    const store = new ALS();
    store.run({}, () => {
      store.set('foo', 'bar');
      process.nextTick(() => {
        expect(store.get('foo')).toEqual('bar');
        process.nextTick(() => {
          expect(store.getStore()).toBeUndefined();
        });

        store.disable();
        expect(store.getStore()).toBeUndefined();

        // Calls to exit() should not mess with enabled status
        store.exit(() => {
          expect(store.getStore()).toBeUndefined();
        });
        expect(store.getStore()).toBeUndefined();

        process.nextTick(() => {
          expect(store.getStore()).toBeUndefined();
          store.run({ bar: 'foo' }, () => {
            expect(store.get('bar')).toEqual('foo');
          });
        });
      });
    });
  });

  test('Exit should work as intended', () => {
    const store = new ALS();
    store.run({}, () => {
      store.set('foo', 'bar');
      store.exit(() => {
        expect(store.getStore()).toBeUndefined();
      });
      expect(store.get('foo')).toEqual('bar');
    });
  });

  test('Exit should able to run when not inside run', () => {
    const store = new ALS();
    const spyFn = jest.fn();
    store.exit(() => {
      spyFn();
      expect(store.getStore()).toBeUndefined();
    });
    expect(spyFn).toBeCalledTimes(1);
  });

  test('Disable should work as intended', () => {
    const store = new ALS();
    store.run({}, () => {
      store.set('foo', 'bar');
      store.disable();
      expect(store.getStore()).toBeUndefined();
    });
    store.disable(); // Wont trigger any error
  });
});
