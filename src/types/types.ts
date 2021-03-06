export type StorageType = Map<string, any>;

export interface Context<T> {
  storageImplementation: string;
  get(key: string): T | undefined;
  set(key: string, value: T): void;
  run<R>(defaults: StorageType, callback: (...args: any[]) => R, ...args: any[]): R;
}
