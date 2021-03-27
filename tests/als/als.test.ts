/* eslint-disable jest/no-done-callback */
import { isAlsSupported, getNodeVersion, nodeVersionString } from '../../dist/utils/nodeVersion';

describe('AsyncLocalStorage tests', () => {
  if (isAlsSupported(getNodeVersion(nodeVersionString))) {
    const ALS = require('../../dist/als/als').default;
    let als = new ALS();

    afterEach(() => {
      als = new ALS();
    });

    describe('Set is called outside of run()', () => {
      test('Should always return undefined', () => {
        als.set('key', 'value');
        expect(als.get('key')).toBeUndefined();
      });
    });

    describe('Set is called inside of run() - 1 (With default)', () => {
      test('Return the default Object provided during run()', (done) => {
        als.run({ key: 'something' }, () => {
          expect(als.get('key')).toBe('something');
          done();
        });
      });
    });

    describe('Set is called inside of run() - 2 (Without default)', () => {
      test('Return the item set during run & undefined for others', (done) => {
        als.run({}, () => {
          als.set('key', 'something');
          expect(als.get('key')).toBe('something');
          expect(als.get('something')).toBeUndefined();
          done();
        });
      });
    });

    describe('Nested case of run() - 1', () => {
      test('Should only get item set inside own run()', async (done) => {
        als.run({}, () => {
          expect(als.get('value')).toBeUndefined();
          als.set('value', 0);
          expect(als.get('value')).toBe(0);
          als.run({}, () => {
            expect(als.get('value')).toBeUndefined();
            als.set('value', 1);
            expect(als.get('value')).toBe(1);
            process.nextTick(() => {
              expect(als.get('value')).toBe(1);
              als.run({}, () => {
                expect(als.get('value')).toBeUndefined();
                als.set('value', 2);
                expect(als.get('value')).toBe(2);
              });
              expect(als.get('value')).toBe(1);
              done();
            });
          });
          expect(als.get('value')).toBe(0);
        });
      }, 10000);
    });
  } else {
    // eslint-disable-next-line jest/expect-expect
    test('dummy test', () => {
      // Avoid Jest Complain
    });
  }
});
