import type { AxiosInstance, AxiosRequestConfig } from 'axios';
import { UseAxiosOptions } from '../types/UseAxiosOptions.type';
import { ACTIONS } from '../constants';
import { UseAxiosResponse } from '../types/UseAxiosResponse.type';
import {
  UseAxiosCache,
  UseAxiosCacheData,
} from '../types/UseAxiosCache.type';
import { UseAxiosCacheMethods } from '../types/UseAxios.type';
import { Dispatch } from '../types/Dispatch.type';

/**
 * Load the cache data from serialized data.
 * @param data Serialized cache data.
 * @param cache The cache instance.
 * @internal
 */
export function loadCache(data: UseAxiosCacheData, cache?: UseAxiosCache) {
  if (!cache) return;
  cache.load(data);
}

/**
 * Serialize the cache data.
 * @param cache The cache instance.
 * @param __ssrPromises The promises created during SSR.
 * @returns The serialized cache data.
 * @internal
 */
export async function serializeCache(
  cache?: UseAxiosCache,
  __ssrPromises: Promise<AxiosInstance>[] = []
) {
  if (!cache) return [];
  const ssrPromisesCopy = [...__ssrPromises];

  __ssrPromises.length = 0;

  await Promise.all(ssrPromisesCopy);

  return cache.dump();
}

/**
 * Clear the cache.
 * @param cache The cache instance.
 * @internal
 */
export function clearCache(cache?: UseAxiosCache) {
  if (!cache) return;
  cache.clear();
}

/**
 * Creates a cache key from the request configuration.
 * @param config The axios request configuration.
 * @returns The cache key.
 * @internal
 */
export function createCacheKey<Req = any>(config: AxiosRequestConfig<Req>) {
  // Copy the original config and delete the cancelToken property
  const cleanedConfig = { ...config };
  delete cleanedConfig.cancelToken;

  // Convert the cleaned config to a JSON string
  return JSON.stringify(cleanedConfig);
}

/**
 * Try to store the response in the cache.
 * @param config The request configuration used to generate the cache key.
 * @param response The response to store in the cache.
 * @param cache The cache instance.
 * @internal
 */
export function tryStoreInCache<Res = any, Req = any>(
  config: AxiosRequestConfig<Req>,
  response: UseAxiosResponse<Res>,
  cache?: UseAxiosCache
) {
  if (!cache) return;

  // Create a cache key from the request params and headers
  const cacheKey = createCacheKey(config);

  // Create a copy of the response object to store in the cache
  const responseForCache = { ...response };

  // Store the response in the cache
  cache.set(cacheKey, responseForCache);
}

/**
 * Try to get the response from the cache.
 * @param config The request configuration used to generate the cache key.
 * @param options The options passed to the hook.
 * @param cache The cache instance.
 * @param dispatch The dispatch function.
 * @returns The response if found in the cache.
 */
export function tryGetFromCache<Res, Req, Err>(
  config: AxiosRequestConfig<Req>,
  options: UseAxiosOptions,
  cache: UseAxiosCache,
  dispatch?: Dispatch<Res, Req, Err>
): void | UseAxiosResponse<Res> {
  // Check if there is a cache enabled and if it should be used
  if (!cache || !options.useCache) return;

  // If the cache is enabled, generate the cache key from the request configuration
  const cacheKey = createCacheKey(config);

  // Check if the cache contains the response for the current request
  const response = cache.get(cacheKey);

  // If the response is found in the cache, return it
  if (response) {
    dispatch?.({ type: ACTIONS.REQUEST_END, payload: response });
    return response;
  }
}

/**
 * The useAxios cache utility methods.
 * @param cache The cache instance.
 * @returns The useAxios cache utility methods.
 * @internal
 */
export function getUseAxiosCacheObject(
  cache?: UseAxiosCache,
  __ssrPromises: Promise<AxiosInstance>[] = []
): UseAxiosCacheMethods {
  return {
    loadCache: (data: UseAxiosCacheData) => loadCache(data, cache),
    serializeCache: () => serializeCache(cache, __ssrPromises),
    clearCache: () => clearCache(cache),
  };
}
