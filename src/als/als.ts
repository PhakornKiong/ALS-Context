import { AsyncLocalStorage, AsyncResource } from 'async_hooks';
import { StorageType, Context } from '../types/types';

export class ALS<T> implements Context<T> {
  storage: AsyncLocalStorage<StorageType>;
  /**
   * Storage's implementation
   * @type {string}
   * @public
   */
  storageImplementation: string;

  constructor() {
    this.storage = new AsyncLocalStorage<StorageType>();
    this.storageImplementation = 'AsyncLocalStorage';
  }

  /**
   * Get the stored value in context or undefined
   * @param  {string} key String key to retrieve stored value
   * @returns T | undefined Return the stored value in context or undefined
   */
  get(key: string): T | undefined {
    const store = this.storage.getStore();
    return store?.get(key);
  }

  /**
   * Set key & value to the current context
   * @param  {string} key String key to be stored
   * @param  {T} value Value to be stored under key for lookup
   * @returns void
   */
  set(key: string, value: T): void {
    const store = this.storage.getStore();
    store?.set(key, value);
  }

  /**
   * Get the entire context in Map object or undefined
   * @returns StorageType | undefined
   */
  getStore(): StorageType | undefined {
    return this.storage.getStore();
  }

  // Provide empty Map by default
  /**
   * Start the boundary of a context, anything set to be run from within the callback will have the same context
   * @param  {Record<string,any>} defaults Optional Map or Record containing default values for context
   * @param  {(...args:any[])=>R} callback Function that will be the boundary of the said context, anything set to be run from within the callback will have the same context
   * @param  {any[]} ...args Option arguments to be passed to be passed to callback
   * @returns R Callback's return value
   */
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
  /**
   * Bind function to current context
   * @param {(...args: any[])=> any} fn Function to be bind to current context
   * @param  {any[]} ...args Option arguments to be passed to be passed to fn
   * @returns any fn's return value
   */
  bind<Func extends (...args: any[]) => any>(fn: Func, ...args: any[]): any {
    // TODO Add validation for functions
    const asyncResource = new AsyncResource('bindFunc');
    const ret = asyncResource.runInAsyncScope.bind(asyncResource, fn, asyncResource, ...args);

    return ret;
  }

  /**
   * Bind function to an AsyncResource context
   * @param {AsyncResource} asyncResource Nodejs AsyncResource from async_hooks
   * @param {(...args: any[])=> any} fn Function to be bind to asyncResource's context
   * @param  {any[]} ...args Option arguments to be passed to be passed to fn
   * @returns any fn's return value
   */
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
