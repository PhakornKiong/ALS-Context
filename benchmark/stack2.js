const { getContext } = require('./util/stack');

console.log(getContext.value, 'undefined');
getContext.value = 1;
console.log(getContext.value, 1);
process.nextTick(() => {
  console.log(getContext.value, 1);
});

Promise.resolve().then(() => {
  t1();
  console.log(getContext.value, 1);
});
setTimeout(() => {
  console.log(getContext.value, 1);
}, 2500);

function t1() {
  console.log((getContext.value = 2));
}
console.log(getContext.value, 'should be 1');
