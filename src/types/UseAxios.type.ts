import { AxiosHooksConfig } from './AxiosHooksConfig.type';
import { UseAxiosCacheData } from './UseAxiosCache.type';

/**
 * The useAxios cache utility methods.
 */
export interface UseAxiosCacheMethods {
  /**
   * Loads the cache data.
   * @param data The cache data to load.
   */
  loadCache(data: UseAxiosCacheData): void;
  /**
   * Serialize the cache data.
   */
  serializeCache(): Promise<UseAxiosCacheData>;
  /**
   * Clear the cache.
   */
  clearCache(): void;
}

/**
 * The useAxios object type.
 */
export interface UseAxiosObject extends UseAxiosCacheMethods {
  /**
   * Configure the useAxios instance.
   * @param config The configuration to apply.
   */
  configure(config: AxiosHooksConfig): void;
  /**
   * Reset the useAxios instance configuration to the default values.
   */
  resetConfigure(): void;

  /**
   * @internal
   */
  __ssrPromises: Promise<any>[];
}
