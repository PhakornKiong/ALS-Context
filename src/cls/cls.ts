// const AsyncResource = require('async_hooks');
// const async_hooks = require('async_hooks');
import { AsyncResource } from 'async_hooks';
import async_hooks from 'async_hooks';
import { AsyncHook, HookCallbacks } from 'node:async_hooks';
import { StorageType, Context } from '../types/types';
process.namespace = {};
type Store = Map<string, unknown>;
export class CLS<T> {
  storageImplementation: string;
  enabled: boolean;
  kResourceStore: symbol;

  constructor() {
    this.kResourceStore = Symbol('kResourceStore');
    this.storageImplementation = 'CLS-Hooked';
    this.enabled = false;
  }

  getStore(): Store | undefined {
    if (this.enabled) {
      const resource = process.namespace;
      // Ugly workaround as TS does not support symbol as index
      return resource[this.kResourceStore as any] as Store;
    }
    return undefined;
  }

  enterWith(store: Store): void {
    this._enable();
    const resource = process.namespace;
    resource[this.kResourceStore as any] = store;
  }

  _enable(): void {
    if (!this.enabled) {
      this.enabled = true;
      storageList.push(this);
      storageHook.enable();
    }
  }

  _propagate(resource: Record<string, unknown>, triggerResource: Record<string, unknown>): void {
    const store = triggerResource[this.kResourceStore as any];
    if (this.enabled) {
      resource[this.kResourceStore as any] = store;
    }
  }

  run<R>(store: Store, callback: (...args: any[]) => R, ...args: any[]): R {
    // Avoid creation of an AsyncResource if store is already active
    if (Object.is(store, this.getStore())) {
      return Reflect.apply(callback, null, args);
    }
    const resource = new AsyncResource('LocalStorage', { requireManualDestroy: true });

    // Calling emitDestroy before runInAsyncScope avoids a try/finally
    // It is ok because emitDestroy only schedules calling the hook
    resource.emitDestroy();
    return resource.runInAsyncScope(() => {
      this.enterWith(store);
      return Reflect.apply(callback, null, args);
    });
  }

  get(key: string): unknown {
    const store = this.getStore();
    return store?.get(key);
  }

  set(key: string, value: unknown): void {
    const store = this.getStore();
    store?.set(key, value);
  }
}

const storageList: any[] = [];

function createHook(fns: HookCallbacks): AsyncHook {
  return async_hooks.createHook(fns);
}

const storageHook = createHook({
  // eslint-disable-next-line @typescript-eslint/ban-types
  init(asyncId: number, type: string, triggerAsyncId: number, resource: object) {
    const currentResource = process.namespace;
    // Value of currentResource is always a non null object
    for (let i = 0; i < storageList.length; ++i) {
      storageList[i]._propagate(resource, currentResource);
    }
  },
});

export default CLS;
