import { AxiosInstance, AxiosRequestConfig } from 'axios';

import { UseAxiosOptions } from '../types/UseAxiosOptions.type';
import { tryGetFromCache } from './../utils/cache';
import { executeRequest } from './executeRequest';
import { UseAxiosCache } from '../types/UseAxiosCache.type';
import { Dispatch } from '../types/Dispatch.type';

/**
 * This method implements the request logic.
 * It first tries to get the response from the cache.
 * If it is not in the cache, it executes the request.
 * **(First Cache Then Network)** policy
 * @param config - The request config to pass to axios instance.
 * @param options - The axios-hooks options.
 * @param dispatch - The dispatch function.
 * @param cache - The cache.
 * @param axiosInstance - The axios instance.
 * @typeParam Res - The response type.
 * @typeParam Req - The request type.
 * @typeParam Err - The error type.
 * @internal
 */
export async function request<Res, Req, Err>(
  config: AxiosRequestConfig<Req>,
  options: UseAxiosOptions,
  dispatch: Dispatch<Res, Req, Err>,
  cache: UseAxiosCache,
  axiosInstance: AxiosInstance
) {
  return (
    tryGetFromCache(config, options, cache, dispatch) ||
    executeRequest(config, dispatch, cache, axiosInstance)
  );
}
