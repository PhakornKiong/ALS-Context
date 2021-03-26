// Test Case from cls-hooked
// To test that context is not lost when working with EE
// https://github.com/nodejs/node/issues/33723
import net from 'net';
import { AsyncResource } from 'async_hooks';

describe('CLS test with net connection', () => {
  const CLS = require('../../dist/cls/cls').default;
  const cls = new CLS();
  let testValue1;
  let testValue2;
  let testValue3;
  let testValue4;

  beforeAll((done) => {
    let serverDone = false;
    let clientDone = false;

    cls.run({}, () => {
      cls.set('test', 'originalValue');

      let server;
      cls.run({}, () => {
        cls.set('test', 'newContextValue');
        const resource = new AsyncResource('foo');
        server = net.createServer((socket) => {
          testValue1 = cls.get('test');
          socket.on(
            'data',
            cls.bindEmitter(resource, () => {
              testValue2 = cls.get('test');
              server.close();
              socket.end('GoodBye');

              serverDone = true;
              checkDone();
            })
          );
        });

        server.listen(() => {
          const address = server.address();

          cls.run({}, () => {
            cls.set('test', 'MONKEY');
            const resource = new AsyncResource('foo');
            const client = net.connect(
              address.port,
              cls.bind(() => {
                testValue3 = cls.get('test');
                client.write('Hello');
              })
            );

            client.on('data', () => {
              testValue4 = cls.get('test');
              clientDone = true;
              checkDone();
            });
          });
        });
      });
    });

    function checkDone() {
      if (serverDone && clientDone) {
        done();
      }
    }
  });

  const newFunc = Function.prototype.bind(this);

  test('value newContextValue', () => {
    expect(testValue1).toBeTruthy();
    expect(testValue1).toBe('newContextValue');
  });

  test('value newContextValue 2', () => {
    expect(testValue2).toBeTruthy();
    expect(testValue2).toBe('newContextValue');
  });

  test('value MONKEY', () => {
    expect(testValue3).toBeTruthy();
    expect(testValue3).toBe('MONKEY');
  });

  test('value MONKEY 2', () => {
    expect(testValue4).toBeTruthy();
    expect(testValue4).toBe('MONKEY');
  });
});
