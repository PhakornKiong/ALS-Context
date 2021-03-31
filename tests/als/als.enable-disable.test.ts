const ALS = require('../../dist/als/als').default;
const store = new ALS();

describe('ALS enable and disable tests', () => {
  test('Disable should work as intended', () => {
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
});
