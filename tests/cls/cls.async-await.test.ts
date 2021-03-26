const CLS = require('../../dist/cls/cls').default;

describe('Verify ALS works with async await', () => {
  let store;
  beforeEach(() => {
    store = new CLS();
  });
  test('Should return the right value after await', () => {
    store.run({}, async () => {
      store.set('foo', 'bar');
      await Promise.resolve;
      expect(store.get('foo')).toBe('bar');
    });
  });

  test('Should return the right value after await - 2', () => {
    store.run({}, async () => {
      await Promise.resolve;
      expect(store.get('foo')).toEqual(undefined);
    });
  });
});
