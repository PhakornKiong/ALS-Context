//  See https://github.com/othiym23/node-continuation-local-storage/issues/64
// Implementation should be type 3
import CLS from '../../dist/cls/cls';
const cls = new CLS();
describe('Check CLS implementation type', () => {
  let conventionId = 0;
  beforeAll(() => {
    let promise: any;
    cls.run({}, function () {
      cls.set('test', 2);
      promise = new Promise(function (resolve) {
        cls.run({}, function () {
          cls.set('test', 1);
          resolve(1);
        });
      });
    });

    cls.run({}, function () {
      cls.set('test', 3);
      promise.then(function () {
        conventionId = cls.get('test') as number;
      });
    });
  });

  test('CLS should follow implementation type 3', () => {
    expect(conventionId).toBe(3);
  });
});
