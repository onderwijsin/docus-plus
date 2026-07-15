import type { Driver } from "unstorage";

export declare const nitroAsyncContext: unknown;
export declare function isMetaKey(key: string): boolean;
export declare function toMetaKey(key: string): string;
export declare function normalizePath(value: string | null | undefined): string | null;
export declare function createCacheDriverWithMeta(options: {
  name: string;
  driver: Driver;
  getRequestPath?: () => string | null;
}): Driver;
