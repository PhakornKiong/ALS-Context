const ALS = require('alscontext').ALS;

const store1 = new ALS();
const store2 = new ALS();

let test1Val;
let test2Val;
let test3Val;
let test4Val;

store1.run({}, () => {
  // Store 1 - outer run starts
  console.log('Store 1 - outer run starts');
  store2.run({}, () => {
    // Store 2 - run starts
    console.log('Store 2 - run starts');
    store1.set('name', 'store1');
    store2.set('name', 'store2');

    setTimeout(() => {
      store1.run({}, () => {
        // Store 1 - inner run starts
        console.log('Store 1 - inner run starts');
        process.nextTick(() => {
          console.log('Store 1 - next Tick starts');
          store1.set('name', 'bob');
          store2.set('name', 'alice');
          setTimeout(() => {
            console.log('Store 1 - timeout starts');
            test3Val = store1.get('name');
            test4Val = store2.get('name');
            console.log(test3Val);
            console.log(test4Val);
            console.log('Store 1 - timeout ends');
          });
          console.log('Store 1 - next Tick ends');
        });
        console.log('Store 1 - inner run ends');
        // Store 1 - inner run ends
      });
    });
    process.nextTick(() => {
      test1Val = store1.get('name');
      test2Val = store2.get('name');
      console.log(test1Val);
      console.log(test2Val);
    });
    console.log('Store 2 - run ends');
    // Store 2 - run ends
  });
  console.log('Store 1 - outer run ends');
  // Store 1 - outer run ends
});

// Take note at the sequence
// Store 1 - outer run starts
// Store 2 - run starts
// Store 2 - run ends
// Store 1 - outer run ends
// store1
// store2
// Store 1 - inner run starts
// Store 1 - inner run ends
// Store 1 - next Tick starts
// Store 1 - next Tick ends
// Store 1 - timeout starts
// bob
// alice
// Store 1 - timeout ends
