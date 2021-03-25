import { AsyncLocalStorage } from 'async_hooks';
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

  // Provide empty Map by default
  run<R>(defaults: Record<string, any>, callback: (...args: any[]) => R, ...args: any[]): R {
    const store: StorageType = defaults ? new Map(Object.entries(defaults)) : new Map();

    return this.storage.run(store, callback, args);
  }
}

export default ALS;
