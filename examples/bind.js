const ALS = require('alscontext').default;
const store = new ALS();

let bindedFunc;
const someFunc = () => {
  return store.get('test');
};
store.run({ test: 'something' }, () => {
  bindedFunc = store.bind(someFunc);
});

bindedFunc(); // return "something"
someFunc(); // return undefined
