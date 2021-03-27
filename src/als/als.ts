import { AsyncLocalStorage, AsyncResource } from 'async_hooks';
import { StorageType, Context } from '../types/types';

export class ALS<T> implements Context<T> {
  storage: AsyncLocalStorage<StorageType>;
  storageImplementation: string;

  constructor() {
    this.storage = new AsyncLocalStorage<StorageType>();
    this.storageImplementation = 'AsyncLocalStorage';
  }

  get(key: string): T | undefined {
    const store = this.storage.getStore();
    return store?.get(key);
  }

  set(key: string, value: T): void {
    const store = this.storage.getStore();
    store?.set(key, value);
  }

  getStore(): StorageType | undefined {
    return this.storage.getStore();
  }

  // Provide empty Map by default
  run<R>(defaults: Record<string, any>, callback: (...args: any[]) => R, ...args: any[]): R {
    let store: Map<any, any>;
    if (defaults instanceof Map) {
      store = defaults;
    } else if (defaults) {
      store = new Map(Object.entries(defaults));
    } else {
      store = new Map();
    }
    return this.storage.run(store, callback, args);
  }

  // Bind a function to current execution context
  bind<Func extends (...args: any[]) => any>(fn: Func, ...args: any[]): any {
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
    console.log(ret);
    return ret;
  }
}

export default ALS;
