import { UseAxiosCache } from './UseAxiosCache.type';
import { UseAxiosOptions } from './UseAxiosOptions.type';
import { AxiosInstance, AxiosStatic } from 'axios';

/**
 * Allows to provide custom instances of cache and axios and to override the default options.
 */
export interface AxiosHooksConfig {
  /**
   * An instance of axios
   */
  axios?: AxiosInstance | AxiosStatic | any;
  /**
   * An instance of lru-cache, or false to disable the cache
   */
  cache?: UseAxiosCache;
  /**
   * An object overriding the default Hook options. It will be merged with the default options.
   */
  defaultOptions?: UseAxiosOptions;
}
