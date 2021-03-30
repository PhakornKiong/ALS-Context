/* eslint-disable jest/no-done-callback */
describe('AsyncLocalStorage tests', () => {
  const CLS = require('../../dist/cls/cls').default;
  let cls = new CLS();

  afterEach(() => {
    cls = new CLS();
  });

  describe('Set is called outside of run()', () => {
    test('Should always return undefined', () => {
      cls.set('key', 'value');
      expect(cls.get('key')).toBeUndefined();
    });
  });

  describe('Set is called inside of run() - 1 (Without default)', () => {
    test('Return the item set during run & undefined for others', (done) => {
      cls.run({}, () => {
        cls.set('key', 'something');
        expect(cls.get('key')).toBe('something');
        expect(cls.get('something')).toBeUndefined();
        done();
      });
    });
  });

  describe('Set is called inside of run() - 2 (With default as Object)', () => {
    test('Return the default Object provided during run()', (done) => {
      cls.run({ key: 'something' }, () => {
        expect(cls.get('key')).toBe('something');
        done();
      });
    });
  });

  describe('Set is called inside of run() - 3 (With default as Map)', () => {
    test('Return the default Object provided during run()', (done) => {
      const map = new Map().set('key', 'something');
      cls.run(map, () => {
        expect(cls.get('key')).toBe('something');
        done();
      });
    });
  });

  describe('Set is called inside of run() - 4 (With invalid default stuff)', () => {
    test('Return the default Object provided during run()', (done) => {
      cls.run('something', () => {
        expect(cls.get('key')).toBeUndefined();
        done();
      });
    });
  });

  describe('Set is called inside of run() - 5 (With current context)', () => {
    test('Return the default Object provided during run()', (done) => {
      cls.run({ key: 'something' }, () => {
        const curStore = cls.getStore();
        cls.run(curStore, () => {
          expect(cls.get('key')).toBe('something');
          done();
        });
        done();
      });
    });
  });

  describe('Nested case of run() - 1', () => {
    test('Should only get item set inside own run()', async (done) => {
      cls.run({}, () => {
        expect(cls.get('value')).toBeUndefined();
        cls.set('value', 0);
        expect(cls.get('value')).toBe(0);
        cls.run({}, () => {
          expect(cls.get('value')).toBeUndefined();
          cls.set('value', 1);
          expect(cls.get('value')).toBe(1);
          process.nextTick(() => {
            expect(cls.get('value')).toBe(1);
            cls.run({}, () => {
              expect(cls.get('value')).toBeUndefined();
              cls.set('value', 2);
              expect(cls.get('value')).toBe(2);
            });
            expect(cls.get('value')).toBe(1);
            done();
          });
        });
        expect(cls.get('value')).toBe(0);
      });
    }, 10000);
  });
});
