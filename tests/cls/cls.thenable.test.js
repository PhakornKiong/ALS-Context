describe('verifies CLS works with thenables', () => {
  // eslint-disable-next-line no-undef
  const CLS = require('../../dist/cls/cls').default;
  const store = new CLS();
  const data = new Map().set('result', Symbol('verifier'));

  const then = (success) => {
    expect(store.getStore()).toEqual(data);
    success();
  };
  const thenable = {
    then,
  };
  // const thenSpy = jest.spyOn(thenable, 'then');

  // afterEach(() => {
  //   thenSpy.mockRestore();
  // });

  test('Await a thenable', () => {
    store.run(data, async () => {
      expect(store.getStore()).toEqual(data);
      await thenable;
      expect(store.getStore()).toEqual(data);
    });
  });
  test('Returning a thenable in an async function', () => {
    store.run(data, async () => {
      try {
        expect(store.getStore()).toEqual(data);
        return thenable;
      } finally {
        expect(store.getStore()).toEqual(data);
      }
    });
  });
  test('Resolving a thenable', () => {
    store.run(data, async () => {
      expect(store.getStore()).toEqual(data);

      Promise.resolve(thenable);
      expect(store.getStore()).toEqual(data);
    });
  });

  test('Returning a thenable in a then handler', () => {
    store.run(data, async () => {
      expect(store.getStore()).toEqual(data);
      Promise.resolve().then(() => thenable);
    });
  });
});
