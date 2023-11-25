import { AxiosRequestConfig } from 'axios'
import { UseAxiosOptions } from '../types/UseAxiosOptions.type'
import { State } from '../types/State.type'

/**
 * This function creates the initial state.
 * @param config - The request config to pass to axiosInstance.
 * @param cache - The cache.
 * @param options - The axios-hooks options.
 * @typeParam Res - The response type.
 * @typeParam Req - The request type.
 * @typeParam Err - The error type.
 * @internal
 */
export function createInitialState<Res, Req, Err>(
  config: AxiosRequestConfig<Req>,
  options: UseAxiosOptions,
  tryGetFromCache: any
): State<Res, Req, Err> {
  // 1. Check if we should try to get the data from the cache
  const response =
    !options.manual && tryGetFromCache(config, options)

  // 2. If we didn't get a response from the cache or the request should be called manually,
  // we need to fetch the data from the server
  // 3. If we got a response, we'll return it
  // 4. If we didn't get a response, we'll return the default values
  return {
    loading: !options.manual && !response,
    error: null,
    ...(response
      ? { data: response.data, response }
      : { data: null, response: null })
  }
}
