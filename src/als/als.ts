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
  run(cb: () => void, defaults?: StorageType): void {
    const store: StorageType = defaults ? new Map(Object.entries(defaults)) : new Map();

    this.storage.run(store, () => {
      cb();
    });
  }
}

export default ALS;
