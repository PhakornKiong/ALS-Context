// Test Case from cls-hooked
// To test that context is not lost when working with EE
// https://github.com/nodejs/node/issues/33723
import net from 'net';
import { AsyncResource } from 'async_hooks';
import { isAlsSupported, getNodeVersion, nodeVersionString } from '../../dist/utils/nodeVersion';
describe('AsyncLocalStorage test with net connection', () => {
  let als;
  if (isAlsSupported(getNodeVersion(nodeVersionString))) {
    const ALS = require('../../dist/als/als').default;
    als = new ALS();
    let testValue1;
    let testValue2;
    let testValue3;
    let testValue4;

    beforeAll((done) => {
      let serverDone = false;
      let clientDone = false;

      als.run({}, () => {
        als.set('test', 'originalValue');

        let server;
        als.run({}, () => {
          als.set('test', 'newContextValue');
          const resource = new AsyncResource('foo');
          server = net.createServer((socket) => {
            testValue1 = als.get('test');
            let x = als.bind(resource, () => {
              testValue2 = als.get('test');
              server.close();
              socket.end('GoodBye');

              serverDone = true;
              checkDone();
            });
            console.log(x);
            socket.on(
              'data',
              als.bindEmitter(resource, () => {
                testValue2 = als.get('test');
                server.close();
                socket.end('GoodBye');

                serverDone = true;
                checkDone();
              })
            );
          });

          server.listen(() => {
            const address = server.address();
            als.run({}, () => {
              als.set('test', 'MONKEY');

              const client = net.connect(address.port, () => {
                testValue3 = als.get('test');
                client.write('Hello');

                client.on('data', () => {
                  testValue4 = als.get('test');
                  clientDone = true;
                  checkDone();
                });
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
      console.log('1', testValue1);
      expect(testValue1).toBeTruthy();
      expect(testValue1).toBe('newContextValue');
    });

    test('value newContextValue 2', () => {
      console.log('2', testValue2);
      expect(testValue2).toBeTruthy();
      expect(testValue2).toBe('newContextValue');
    });

    test('value MONKEY', () => {
      console.log('3', testValue3);
      expect(testValue3).toBeTruthy();
      expect(testValue3).toBe('MONKEY');
    });

    test('value MONKEY 2', () => {
      console.log('4', testValue4);
      expect(testValue4).toBeTruthy();
      expect(testValue4).toBe('MONKEY');
    });
  } else {
    test('dummy test', () => {
      // Avoid Jest Complain
    });
  }
}, 15000);
