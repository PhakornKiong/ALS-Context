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
  kResourceStore: symbol;
  storage: StorageType;
  active: any;
  _contexts: any;

  constructor() {
    // k.ResourceStore is unique/incremental index for storing context
    this.kResourceStore = Symbol('kResourceStore');
    // this.kResourceStore = uuid();
    // this.kResourceStore = async_hooks.executionAsyncId();
    this.storageImplementation = 'CLS-Hooked';
    this.enabled = false;
    this.storage = new Map();
    this.active = null;
    this._contexts = new Map();
  }

  getStore(): Store | undefined {
    if (this.enabled) {
      // const resource = process.namespace;
      // const resource = nameSpaceObj;
      // const resource = async_hooks.executionAsyncResource() as any;
      // const resource = nameSpaceObj[async_hooks.executionAsyncId()];
      // debug2(nameSpaceObj);
      // debug2(async_hooks.executionAsyncId());
      const resource = this._contexts.get(async_hooks.executionAsyncId());

      if (resource == undefined) {
        // debug2(async_hooks.executionAsyncId());
        // debug2(this._contexts);
        return undefined;
      }
      // Ugly workaround as TS does not support symbol as index
      // return resource[this.kResourceStore as any] as Store;
      // Using execution AsyncID will create new context for each new asyncID
      // return resource[async_hooks.executionAsyncId()] as Store;
      // return resource[this.kResourceStore] as Store;
      return this._contexts.get(async_hooks.executionAsyncId())[this.kResourceStore] as Store;
    }
    return undefined;
  }

  enterWith(store: StorageType, asyncResource: AsyncResource): void {
    this._enable(asyncResource);
    // const resource = process.namespace;
    // const resource = nameSpaceObj;
    // const resource = async_hooks.executionAsyncResource() as any;
    // const resource = nameSpaceObj[asyncResource.asyncId()];
    const resource = this._contexts.get(asyncResource.asyncId());

    // Not sure why using symbol as index will cause object to be reset
    // resource[this.kResourceStore as any] = store;
    // Using execution AsyncID will create new context for each new asyncID
    // resource[async_hooks.executionAsyncId()] = store;
    // resource[this.kResourceStore as any] = store;
    resource[this.kResourceStore as any] = store;
    // debug2(Object.keys(process.namespace));
  }

  _enable(asyncResource: AsyncResource): void {
    if (!this.enabled) {
      this.enabled = true;
      storageList.push(this);
      // eslint-disable-next-line @typescript-eslint/no-this-alias
      const self = this;
      const storageHook = async_hooks.createHook({
        // eslint-disable-next-line @typescript-eslint/ban-types
        init(asyncId: number, type: string, triggerAsyncId: number, resource: object) {
          // let currentUid = async_hooks.executionAsyncId();
          // const currentResource = process.namespace;
          // Get AsyncResource <- this works!
          // const currentResource = async_hooks.executionAsyncResource();
          // debug2(resource);
          // debug2(self);
          const currentResource = nameSpaceObj[asyncResource.asyncId()];
          // debug2(currentResource);
          //   ? nameSpaceObj[async_hooks.executionAsyncId()]
          //   : nameSpaceObj;
          if (self.active) {
            self._contexts.set(asyncId, self.active);
          } else {
            // self._contexts.set(asyncId, currentResource);
          }

          // Value of currentResource is always a non null object
          for (let i = 0; i < storageList.length; ++i) {
            storageList[i]._propagate(resource, currentResource);
          }
        },
        // before(asyncId) {
        //   debug2('before');
        // },
        // after(asyncId) {
        //   debug2('after');
        // },
        // destroy(asyncId: number) {
        //   debug2('destroy ran', 'current namespace: ', process.namespace, ' ', asyncId);
        // },
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

    const store: StorageType = defaults ? new Map(Object.entries(defaults)) : new Map();

    const resource = new AsyncResource('LocalStorage', { requireManualDestroy: false });
    this._contexts.set(resource.asyncId(), resource);
    // Keep reference to asyncResource
    nameSpaceObj[resource.asyncId()] = resource;
    // Calling emitDestroy before runInAsyncScope avoids a try/finally
    // It is ok because emitDestroy only schedules calling the hook
    // resource.emitDestroy();
    // return resource.emitDestroy().runInAsyncScope(() => {
    //   this.enterWith(store);
    //   return Reflect.apply(callback, null, args);
    // });

    return resource.emitDestroy().runInAsyncScope(() => {
      this.enterWith(store, resource);
      this.active = resource;
      const res = Reflect.apply(callback, null, args);
      this.active = null;
      return res;
    });
  }

  get(key: string): T | undefined {
    const store = this.getStore();
    return store?.get(key);
  }

  set(key: string, value: unknown): void {
    const store = this.getStore();
    store?.set(key, value);
  }
}

const storageList: any[] = [];

// function createHook(fns: HookCallbacks): AsyncHook {
//   return async_hooks.createHook(fns);
// }

// const storageHook = createHook({
//   // eslint-disable-next-line @typescript-eslint/ban-types
//   init(asyncId: number, type: string, triggerAsyncId: number, resource: object) {
//     // let currentUid = async_hooks.executionAsyncId();

//     // const currentResource = process.namespace;
//     // Get AsyncResource <- this works!
//     // const currentResource = async_hooks.executionAsyncResource();
//     // debug2(resource);
//     const currentResource = nameSpaceObj[async_hooks.executionAsyncId()]
//       ? nameSpaceObj[async_hooks.executionAsyncId()]
//       : nameSpaceObj;
//     // debug2(nameSpaceObj);
//     // debug2(resource);
//     // Value of currentResource is always a non null object
//     // for (let i = 0; i < storageList.length; ++i) {
//     //   storageList[i]._propagate(resource, currentResource);
//     // }
//     // debug2(resource);
//   },
//   // before(asyncId) {
//   //   debug2('before');
//   // },
//   // after(asyncId) {
//   //   debug2('after');
//   // },
//   // destroy(asyncId: number) {
//   //   debug2('destroy ran', 'current namespace: ', process.namespace, ' ', asyncId);
//   // },
// });

export default CLS;
const fs = require('fs');
function debug2(...args: any[]) {
  fs.writeFileSync(1, `${util.format(...args)}\n`, { flag: 'a' });
}
