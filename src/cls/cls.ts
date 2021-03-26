// const AsyncResource = require('async_hooks');
// const async_hooks = require('async_hooks');
import { AsyncResource } from 'async_hooks';
import async_hooks from 'async_hooks';
// import { AsyncHook, HookCallbacks } from 'node:async_hooks';
import { StorageType, Context } from '../types/types';
import util from 'util';

const nameSpaceObj: any = {};
// process.namespace = {};
type Store = Map<string, any>;
// Create increment number to propagate namespace
// let id = 1;
// function uuid() {
//   return id++;
// }
export class CLS<T> implements Context<T> {
  storageImplementation: string;
  enabled: boolean;
  kResourceStore: string;
  storage: StorageType;
  active: any;
  _contexts: Map<any, any>;
  _idRef: Map<any, any>;

  constructor() {
    // k.ResourceStore is unique/incremental index for storing context
    // this.kResourceStore = Symbol('kResourceStore');
    this.kResourceStore = 'something';
    // this.kResourceStore = async_hooks.executionAsyncId();
    this.storageImplementation = 'CLS-Hooked';
    this.enabled = false;
    this.storage = new Map();
    this.active = null;
    this._contexts = new Map();
    this._idRef = new Map();
  }

  getStore(): Store | undefined {
    if (this.enabled) {
      // const resource = process.namespace;
      // const resource = nameSpaceObj;
      // const resource = async_hooks.executionAsyncResource() as any;
      // const resource = nameSpaceObj[async_hooks.executionAsyncId()];
      // debug2(nameSpaceObj);
      // debug2(async_hooks.executionAsyncId());
      // debug2(async_hooks.executionAsyncId());
      // const idRef = this._idRef.get(async_hooks.executionAsyncId());
      // debug2(this._idRef);
      // const resource = this._contexts.get(idRef);
      const resource = this._contexts.get(async_hooks.executionAsyncId());

      // if (resource == undefined) {
      //   //   // debug2(async_hooks.executionAsyncId());
      //   //   // debug2(this._contexts);
      //   return undefined;
      // }
      // Ugly workaround as TS does not support symbol as index
      // return resource[this.kResourceStore as any] as Store;
      // Using execution AsyncID will create new context for each new asyncID
      // return resource[async_hooks.executionAsyncId()] as Store;
      // return resource[this.kResourceStore] as Store;
      return resource as Store;
    }
    return undefined;
  }

  enterWith(store: StorageType, asyncResource: AsyncResource): void {
    this._enable(asyncResource);
    // const resource = this._contexts.get(asyncResource.asyncId());

    // Not sure why using symbol as index will cause object to be reset
    // resource[this.kResourceStore as any] = store;
    // Using execution AsyncID will create new context for each new asyncID
    // resource[async_hooks.executionAsyncId()] = store;
    // resource[this.kResourceStore as any] = store;

    // debug2(Object.keys(process.namespace));
  }

  _enable(asyncResource: AsyncResource): void {
    if (!this.enabled) {
      this.enabled = true;
      // eslint-disable-next-line @typescript-eslint/no-this-alias
      const self = this;
      const storageHook = async_hooks.createHook({
        // eslint-disable-next-line @typescript-eslint/ban-types
        init(asyncId: number, type: string, triggerAsyncId: number, resource: object) {
          // const currentResource = nameSpaceObj[asyncResource.asyncId()];
          // Skip appending of AsyncResource into _contexts as it is already available
          // if (
          //   type === 'PROMISE' ||
          //   type === 'Timeout' ||
          //   type === 'TTYWRAP' ||
          //   type === 'SIGNALWRAP'
          // ) {
          //   // debug2(self.active.asyncId());
          //   self._idRef.set(asyncId, self.active.asyncId());
          //   return;
          // }
          // if (type === 'LocalStorage' || type === 'TickObject') {
          //   // debug2(self.active.asyncId());
          //   self._idRef.set(asyncId, asyncId);
          //   return;
          // }
          // debug2(type);
          // debug2('init', 'type: ', type, 'id: ', asyncId);
          if (self.active) {
            self._contexts.set(asyncId, self.active[self.kResourceStore]);
          } else {
            // self._contexts.set(asyncId, currentResource);
          }
        },
        // before(asyncId) {
        //   debug2('before', asyncId);
        // },
        after(asyncId) {
          // debug2('after', asyncId);
          // To be review, do we need contexts till it is destroyed?
          self._contexts.delete(asyncId);
        },
        destroy(asyncId: number) {
          self._contexts.delete(asyncId);
        },
      });
      storageHook.enable();
    }
  }

  _propagate(resource: Record<string, unknown>, triggerResource: Record<string, unknown>): void {
    if (triggerResource == undefined) {
      return;
    }
    const store = triggerResource[this.kResourceStore as any];
    if (this.enabled) {
      resource[this.kResourceStore as any] = store;
    }
  }

  run<R>(defaults: Record<string, any>, callback: (...args: any[]) => R, ...args: any[]): R {
    // Avoid creation of an AsyncResource if store is already active
    if (Object.is(defaults, this.getStore())) {
      return Reflect.apply(callback, null, args);
    }
    let store: Map<any, any>;

    if (defaults instanceof Map) {
      store = defaults;
    } else if (defaults) {
      store = new Map(Object.entries(defaults));
    } else {
      store = new Map();
    }

    const resource = new AsyncResource('LocalStorage', { requireManualDestroy: false }) as any;

    resource[this.kResourceStore] = store;
    this._contexts.set(resource.asyncId(), resource[this.kResourceStore]);

    return resource.emitDestroy().runInAsyncScope(() => {
      this.enterWith(store, resource);
      this.active = resource;
      const res = Reflect.apply(callback, null, args);
      this.active = null;
      // this._contexts = new Map();
      return res;
    });
  }

  get(key: string): T | undefined {
    const store = this.getStore();
    // debug2(async_hooks.executionAsyncId());
    return store?.get(key);
  }

  set(key: string, value: unknown): void {
    const store = this.getStore();
    store?.set(key, value);
  }

  // Bind a function to current execution context
  bind<Func extends (...args: any[]) => any>(fn: Func, ...args: []): any {
    // TODO Add validation for functions
    const asyncResource = new AsyncResource('bindFunc');
    const ret = asyncResource.runInAsyncScope.bind(asyncResource, fn, asyncResource, ...args);

    return ret;
  }

  bindEmitter<Func extends (...args: any[]) => any>(
    asyncResource: AsyncResource,
    fn: Func,
    ...args: []
  ): any {
    // TODO Add validation for functions
    // validateFunction(fn, 'fn');
    const ret = asyncResource.runInAsyncScope.bind(asyncResource, fn, asyncResource, ...args);
    // To make it work with EE
    Object.defineProperties(ret, {
      length: {
        configurable: true,
        enumerable: false,
        value: fn.length,
        writable: false,
      },
      asyncResource: {
        configurable: true,
        enumerable: true,
        value: this,
        writable: true,
      },
    });
    return ret;
  }
}

export default CLS;
const fs = require('fs');
function debug2(...args: any[]) {
  fs.writeFileSync(1, `${util.format(...args)}\n`, { flag: 'a' });
}
