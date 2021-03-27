let cnt = 0;
let xcnt = 0;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const CONTEXT_PREFIX = '-@CID@';

let globalLastContextId = 0;
const globalActiveContexts = {};

function getContext() {
  const curPrepareStackTrace = Error.prepareStackTrace;
  const curLimit = Error.stackTraceLimit;

  try {
    Error.stackTraceLimit = Infinity;
    Error.prepareStackTrace = function (_error, callSite) {
      return callSite;
    };

    const stackObj = {};
    Error.captureStackTrace(stackObj);

    if (stackObj.stack) {
      for (const c of stackObj.stack) {
        const fn = c.getFunctionName();
        if (fn?.startsWith(CONTEXT_PREFIX)) {
          const contextId = fn.slice(CONTEXT_PREFIX.length);
          return globalActiveContexts[contextId];
        }
      }
    }
  } finally {
    Error.prepareStackTrace = curPrepareStackTrace;
    Error.stackTraceLimit = curLimit;
  }
}

function t4(info = 't4') {
  console.log(info + '+1', getContext().a);
  getContext().a = 'zzz';
  xcnt++;
  console.log(info + '+2', getContext().a);
}

async function t3(info = 't3') {
  console.log(info + '+1', getContext().a);
  getContext().a = 'bbb';
  console.log(info + '+2', getContext().a);
  t4(info + ' sync t4+1');
  console.log(info + '+3', getContext().a);
}

async function t2(info = 't2') {
  console.log(info + '+1', getContext().a);
  getContext().a = 'aaa';
  console.log(info + '+2', getContext().a);
  await t3('async t2-t3');
  console.log(info + '+3', getContext().a);
  await runPromise(async () => {
    await t3('run t2-t3');
  });
  console.log(info + '+4', getContext().a);
  setTimeout(async () => {
    await runPromise(async () => {
      await t3('timer t3');
    });
  }, 0);
  console.log(info + '+5', getContext().a);
}

async function runPromise(func) {
  const prevContext = getContext();
  const contextIdValue = ++globalLastContextId;
  const contextId = contextIdValue.toString(36);
  const contextManagerName = '-@CID@' + contextId;
  const contextManager = {
    async [contextManagerName]() {
      await func();
    },
  }[contextManagerName];
  try {
    globalActiveContexts[contextId] = { ...prevContext, _id: contextId };
    await contextManager();
  } finally {
    delete globalActiveContexts[contextId];
  }
}

async function t1() {
  let start = Date.now();
  let i;
  for (i = 1; i <= 100000; i++) {
    await runPromise(t2);
    await sleep(10);
  }
  console.log((Date.now() - start) / i, i);
}

module.exports = { getContext };
