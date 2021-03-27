import ALS from '../../dist/als/als';
const store1 = new ALS();
const store2 = new ALS();

describe('ALS able to handle multiple instances correctly', () => {
  let test1Val;
  let test2Val;
  let test3Val;
  let test4Val;
  // eslint-disable-next-line jest/no-done-callback
  test('nested 2 instance run', (done) => {
    store1.run({}, () => {
      store2.run({}, () => {
        store1.set('name', 'store1');
        store2.set('name', 'store2');

        setTimeout(() => {
          store1.run({}, () => {
            process.nextTick(() => {
              store1.set('name', 'bob');
              store2.set('name', 'alice');
              test3Val = store1.get('name');
              test4Val = store2.get('name');
              expect(test3Val).toEqual('bob');
              expect(test4Val).toEqual('alice');
              done();
            });
          });
        });
        process.nextTick(() => {
          test1Val = store1.get('name');
          test2Val = store2.get('name');
          expect(test1Val).toEqual('store1');
          expect(test2Val).toEqual('store2');
        });
      });
    });
  });
});
