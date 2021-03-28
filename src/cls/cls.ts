import { AsyncResource } from 'async_hooks';
import async_hooks from 'async_hooks';
import { StorageType, Context } from '../types/types';
// import util from 'util';

// Create increment number to propagate unique id
let id = 1;
function uuid() {
  return id++;
}
export class CLS<T> implements Context<T> {
  /**
   * Storage's implementation
   * @type {string}
   * @public
   */
  storageImplementation: string;
  enabled: boolean;
  kResourceStore: number;
  active: any;
  _contexts: Map<any, any>;

  constructor() {
    this.kResourceStore = uuid();
    this.storageImplementation = 'CLS-Hooked';
    this.enabled = false;
    this.active = null;
    this._contexts = new Map();
  }

  /**
   * Get the entire context in Map object or undefined
   * @returns StorageType | undefined
   */
  getStore(): StorageType | undefined {
    if (this.enabled) {
      // Alternative context grab when async function is scheduled in asyncScope, but run way after cls.run() had finished
      const resource =
        this._contexts.get(async_hooks.executionAsyncId()) ||
        this._contexts.get(async_hooks.triggerAsyncId);
      return resource as StorageType;
    }
    return undefined;
  }

  enterWith(): void {
    this._enable();
  }

  _enable(): void {
    if (!this.enabled) {
      this.enabled = true;
      // eslint-disable-next-line @typescript-eslint/no-this-alias
      const self = this;
      const storageHook = async_hooks.createHook({
        // eslint-disable-next-line @typescript-eslint/ban-types, @typescript-eslint/no-unused-vars
        init(asyncId: number, type: string, triggerAsyncId: number, resource: object) {
          if (self.active) {
            self._contexts.set(asyncId, self.active[self.kResourceStore]);
          } else {
            self._contexts.set(asyncId, self._contexts.get(triggerAsyncId));
          }
        },
        // before(asyncId) {
        // },
        // after(asyncId) {
        //   // debug2('after', asyncId);
        //   // To be review, do we need contexts till it is destroyed?
        //   // This doesn't really help
        //   // self._contexts.delete(asyncId);
        // },
        destroy(asyncId: number) {
          self._contexts.delete(asyncId);
          // Do i need to clear self.active? if not set to null when exiting asyncResource.runInAsyncScope
          // if (self.active && self.active.asyncId() === asyncId) {
          //   debug2('delete');
          //   self.active = null;
          // }
          // debug2('destroy', asyncId);
        },
      });
      storageHook.enable();
    }
  }

  /**
   * Start the boundary of a context, anything set to be run from within the callback will have the same context
   * @param  {Record<string,any>} defaults Optional Map or Record containing default values for context
   * @param  {(...args:any[])=>R} callback Function that will be the boundary of the said context, anything set to be run from within the callback will have the same context
   * @param  {any[]} ...args Option arguments to be passed to be passed to callback
   * @returns R callback's return value
   */
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

    const resource = new AsyncResource('LocalStorage', { requireManualDestroy: true }) as any;

    resource[this.kResourceStore] = store;
    this._contexts.set(resource.asyncId(), resource[this.kResourceStore]);

    return resource.emitDestroy().runInAsyncScope(() => {
      this.enterWith();
      this.active = resource;
      const res = Reflect.apply(callback, null, args);
      // Do we need to set to null here?
      // Might have edge case where async is schedule for long and context is lost?
      this.active = null;
      return res;
    });
  }
  /**
   *
   * Get the stored value in context or undefined
   * @param  {string} key String key to retrieve stored value
   * @returns T | undefined Return the stored value in context or undefined
   */
  get(key: string): T | undefined {
    const store = this.getStore();
    return store?.get(key);
  }

  /**
   * Set key & value to the current context
   * @param  {string} key String key to be stored
   * @param  {T} value Value to be stored under key for lookup
   * @returns void
   */
  set(key: string, value: T): void {
    const store = this.getStore();
    store?.set(key, value);
  }

  /**
   * Bind function to current context
   * @param {(...args: any[])=> any} fn Function to be bind to current context
   * @param  {any[]} ...args Option arguments to be passed to be passed to fn
   * @returns any fn's return value
   */
  // Bind a function to current execution context
  bind<Func extends (...args: any[]) => any>(fn: Func, ...args: []): any {
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
    return ret;
  }
}

export default CLS;
// const fs = require('fs');
// function debug2(...args: any[]) {
//   fs.writeFileSync(1, `${util.format(...args)}\n`, { flag: 'a' });
// }
