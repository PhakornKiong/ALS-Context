const ALS = require('../dist/als/als').default;
console.log(ALS);
const store = new ALS();
const END = 300000;

const { writeResult } = require('./util/writeFile');
const result = [];
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function t1(l) {
  if (l > 1) {
  }
  store.set('hello', 'there');
  store.get('hello');
}
const start = Date.now();
async function tx() {
  let prev_avr_delta = 0;
  let avr_delta_sum = 0;
  let avr_cnt = 0;
  for (let loop = 0; loop < END; loop++) {
    const start = Date.now();
    await store.run({}, t1);
    const delta = Date.now() - start;
    avr_delta_sum += delta;
    avr_cnt++;

    if (loop % 1000 === 0) {
      const avr_delta = avr_delta_sum / avr_cnt;
      console.log(`loop ${loop}, avr per runPromise: ${avr_delta.toFixed(3)} ms`);
      result.push(`loop ${loop}, avr per runPromise: ${avr_delta.toFixed(3)} ms`);
      prev_avr_delta = avr_delta;
      avr_cnt = 0;
      avr_delta_sum = 0;
    }
  }
}

const fileName = __filename.slice(__dirname.length + 1);

tx().then(() => {
  totalTime = Date.now() - start;
  console.log(`${totalTime}ms`);
  writeResult(fileName, result, totalTime);
});
