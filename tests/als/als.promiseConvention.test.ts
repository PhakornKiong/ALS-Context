//  See https://github.com/othiym23/node-continuation-local-storage/issues/64
// Implementation should be type 3
import ALS from '../../dist/als/als';
const als = new ALS();
describe('Check ALS implementation type', () => {
  let conventionId = 0;
  beforeAll(() => {
    let promise: any;
    als.run({}, function () {
      als.set('test', 2);
      promise = new Promise(function (resolve) {
        als.run({}, function () {
          als.set('test', 1);
          resolve(1);
        });
      });
    });

    als.run({}, function () {
      als.set('test', 3);
      promise.then(function () {
        conventionId = als.get('test') as number;
      });
    });
  });

  test('ALS should follow implementation type 3', () => {
    expect(conventionId).toBe(3);
  });
});
