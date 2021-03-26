const util = require('util');
const async_hooks = require('async_hooks');
const assert = require('assert');
let currentUid = -1;

function Namespace(name) {
  this.name = name;
  // changed in 2.7: no default context
  this.active = null;
  this._set = [];
  this.id = null;
  // this._contexts = new Map();
  this._contexts = {};
  this._indent = 0;
}

Namespace.prototype.set = function set(key, value) {
  if (!this.active) {
    throw new Error('No context available. ns.run() or ns.bind() must be called first.');
  }

  this.active[key] = value;
  return value;
};

Namespace.prototype.get = function get(key) {
  if (!this.active) {
    return undefined;
  }

  return this.active[key];
};

Namespace.prototype.createContext = function createContext() {
  // Prototype inherit existing context if created a new child context within existing context.
  // let context = Object.create(this.active ? this.active : Object.prototype);
  // let context = {...this.active}
  let context = {};
  context._ns_name = this.name;
  context.id = currentUid;
  return context;
};

Namespace.prototype.run = function run(fn) {
  let context = this.createContext();
  this.enter(context);

  try {
    fn(context);
    return context;
  } catch (exception) {
    throw exception;
  } finally {
    this.exit(context);
  }
};

Namespace.prototype.runAndReturn = function runAndReturn(fn) {
  let value;
  this.run(function (context) {
    value = fn(context);
  });
  return value;
};

/**
 * Uses global Promise and assumes Promise is cls friendly or wrapped already.
 * @param {function} fn
 * @returns {*}
 */
// Namespace.prototype.runPromise = function runPromise(fn) {
//   let context = this.createContext();
//   this.enter(context);

//   let promise = fn(context);
//   if (!promise || !promise.then || !promise.catch) {
//     throw new Error('fn must return a promise.');
//   }
//   return promise
//     .then((result) => {
//       this.exit(context);
//       return result;
//     })
//     .catch((err) => {
//       this.exit(context);
//       throw err;
//     });
// };

Namespace.prototype.enter = function enter(context) {
  assert.ok(context, 'context must be provided for entering');
  this._set.push(this.active);
  this.active = context;
};

Namespace.prototype.exit = function exit(context) {
  assert.ok(context, 'context must be provided for exiting');

  // Fast path for most exits that are at the top of the stack
  if (this.active === context) {
    assert.ok(this._set.length, "can't remove top context");
    this.active = this._set.pop();
    return;
  }

  // Fast search in the stack using lastIndexOf
  let index = this._set.lastIndexOf(context);

  if (index < 0) {
    assert.ok(
      index >= 0,
      "context not currently entered; can't exit. \n" +
        util.inspect(this) +
        '\n' +
        util.inspect(context)
    );
  } else {
    this._set.splice(index, 1);
  }
};

function getNamespace(name) {
  return process.namespaces[name];
}

function createNamespace(name) {
  let namespace = new Namespace(name);
  namespace.id = currentUid;

  const hook = async_hooks.createHook({
    init(asyncId, type, triggerId, resource) {
      currentUid = async_hooks.executionAsyncId();
      if (namespace.active) {
        // namespace._contexts.set(asyncId, namespace.active);
        namespace._contexts[asyncId] = namespace.active;
      } else if (currentUid === 0) {
        // CurrentId will be 0 when triggered from C++. Promise events
        // https://github.com/nodejs/node/blob/master/doc/api/async_hooks.md#triggerid
        const triggerId = async_hooks.triggerAsyncId();
        // const triggerIdContext = namespace._contexts[triggerId]
        const triggerIdContext = namespace._contexts[triggerId];
        if (triggerIdContext) {
          // namespace._contexts.set(asyncId, triggerIdContext);
          namespace._contexts[asyncId] = triggerIdContext;
        }
      }
    },
    before(asyncId) {
      currentUid = async_hooks.executionAsyncId();
      let context;

      //HACK to work with promises until they are fixed in node > 8.1.1
      // context = namespace._contexts.get(asyncId) || namespace._contexts.get(currentUid);
      context = namespace._contexts[asyncId] || namespace._contexts[currentUid];

      if (context) {
        namespace.enter(context);
      }
    },
    after(asyncId) {
      currentUid = async_hooks.executionAsyncId();

      let context;
      //HACK to work with promises until they are fixed in node > 8.1.1
      // context = namespace._contexts.get(asyncId) || namespace._contexts.get(currentUid);
      context = namespace._contexts[asyncId] || namespace._contexts[currentUid];
      if (context) {
        namespace.exit(context);
      }
    },
    destroy(asyncId) {
      currentUid = async_hooks.executionAsyncId();

      delete namespace._contexts[asyncId];
    },
  });

  hook.enable();

  process.namespaces[name] = namespace;
  return namespace;
}

function destroyNamespace(name) {
  let namespace = getNamespace(name);

  assert.ok(namespace, 'can\'t delete nonexistent namespace! "' + name + '"');
  assert.ok(
    namespace.id,
    "don't assign to process.namespaces directly! " + util.inspect(namespace)
  );

  process.namespaces[name] = null;
}

function reset() {
  // must unregister async listeners
  if (process.namespaces) {
    Object.keys(process.namespaces).forEach(function (name) {
      destroyNamespace(name);
    });
  }
  process.namespaces = Object.create(null);
}
const fs = require('fs');
function debug2(...args) {
  fs.writeFileSync(1, `${util.format(...args)}\n`, { flag: 'a' });
}

process.namespaces = {};
module.exports = {
  getNamespace: getNamespace,
  createNamespace: createNamespace,
  destroyNamespace: destroyNamespace,
  reset: reset,
};
