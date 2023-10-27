import React from 'react';
import { AxiosRequestConfig, AxiosInstance } from 'axios';
import { isReactEvent } from '../utils/isReactEvent';
import { configToObject } from '../utils/configToObject';
import { reducer } from '../state/reducer';
import { createInitialState } from '../state/createInitialState';
import { UseAxiosOptions } from '../types';
import { request } from '../requests/request';
import { Reducer } from '../types/Reducer.type';
import { CancelFn } from '../types/Cancel.type';
import { UseAxiosResult } from '../types/UseAxiosResult.type';
import { RefetchFunction } from '../types/RefetchFunction.type';
import { UseAxiosCache } from '../types/UseAxiosCache.type';

/**
 * This function is the core of the library. It is used by the other hooks.
 * @param config - The config.
 * @param options - The options.
 * @param defaultOptions - The default options.
 * @param axiosInstance - The axios instance.
 * @param cache - The cache.
 * @internal
 */
export function useAxiosIntern<Res, Req, Err>(
  config: AxiosRequestConfig<Req>,
  options: UseAxiosOptions,
  axiosInstance: AxiosInstance,
  cache: UseAxiosCache
): UseAxiosResult<Res, Req, Err> {

  const abortControllerRef = React.useRef<AbortController>();

  const [state, dispatch] = React.useReducer<Reducer<Res, Req, Err>>(
    reducer,
    createInitialState(config, cache, options)
  );

  /**
   * This function cancels the outstanding request.
   */
  const cancelOutstandingRequest: CancelFn = React.useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  }, []);

  /**
   * This function adds the abort signal to the config.
   * @param config - The config.
   * @internal
   */
  const withAbortSignal = React.useCallback(
    (config: AxiosRequestConfig<Req>) => {
      if (options.autoCancel) {
        cancelOutstandingRequest();
      }

      abortControllerRef.current = new AbortController();

      config.signal = abortControllerRef.current.signal;

      return config;
    },
    [cancelOutstandingRequest, options.autoCancel]
  );

  React.useEffect(() => {
    if (!options.manual) {
      request(
        withAbortSignal(config),
        options,
        dispatch,
        cache,
        axiosInstance
      ).catch(() => {});
    }

    return () => {
      if (options.autoCancel) cancelOutstandingRequest();
    };
  }, [
    config,
    options,
    cache,
    axiosInstance,
    withAbortSignal,
    cancelOutstandingRequest,
  ]);

  const refetch: RefetchFunction<Res, Req> = React.useCallback(
    (configOverride = {}, options = {}) => {
      return request(
        withAbortSignal({
          ...config,
          ...(isReactEvent(configOverride)
            ? null
            : configToObject(configOverride)),
        }),
        { useCache: false, ...options },
        dispatch,
        cache,
        axiosInstance
      );
    },
    [config, cache, axiosInstance, withAbortSignal]
  );

  return [state, refetch, cancelOutstandingRequest];
}
