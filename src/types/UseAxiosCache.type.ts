import type { LRUCache } from 'lru-cache';
import { UseAxiosResponse } from './UseAxiosResponse.type';

/**
 * The useAxios cache object type.
 */
export type UseAxiosCache = LRUCache<string, UseAxiosResponse> | false;
/**
 * The useAxios cache data type (the result of cache serialization).
 */
export type UseAxiosCacheData = [string, LRUCache.Entry<UseAxiosResponse>][];
