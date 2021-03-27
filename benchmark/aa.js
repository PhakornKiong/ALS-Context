const ALS = require('../dist/cls/cls').default;
const store = new ALS();

store.run({}, () => {
  // store.get('value') return undefined

  store.set('value', 0);
  // store.get('value') return 0

  requestHandler();
});

function requestHandler() {
  store.run({}, () => {
    // store.get('value') return undefined
    store.set('value', 1);
    // store.get('value') return 1

    process.nextTick(() => {
      // store.get('value') return 1

      store.run({}, () => {
        // store.get('value') return undefined

        store.set('value', 2);
        // store.get('value') return 2
      });
      // store.get('value') return 1
      console.log(store.get('value'));
    });
  });

  setTimeout(function () {
    // runs with the default context, because nested contexts have ended
    console.log(store.get('value')); // prints 0
  }, 1000);
}
