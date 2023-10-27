import { LRUCache } from "lru-cache";
import StaticAxios, { AxiosInstance } from "axios";

import { AxiosHooksConfig, UseAxiosOptions } from "./types";
import { DEFAULT_OPTIONS } from "./constants";
import { useAxiosIntern } from "./hooks/useAxiosIntern";
import { UseAxiosCache } from "./types/UseAxiosCache.type";
import { UseAxiosConfig } from "./types/UseAxiosConfig.type";
import { getUseAxiosCacheObject } from "./utils/cache";
import { isSsrActive } from "./utils/isSsrActive";
import { configToObject } from "./utils/configToObject";
import useDeepCompareMemo from "./hooks/useDeepCompareMemo";

/**
 * Creates an instance of the `useAxios` hook configured with the supplied cache,
 * axios instance and default options.
 * @param config Allows to provide custom instances of cache and axios and to override the default options.
 * @returns An instance of `useAxios` React Hook which will always use the provided cache and axios instance.
 * @function
 */
export function makeUseAxios(config?: AxiosHooksConfig) {
  let cache: UseAxiosCache = false;
  let axiosInstance: AxiosInstance;
  let defaultOptions: UseAxiosOptions;

  /**
   * This array contains the promises that are created during SSR.
   * @internal
   */
  const __ssrPromises: Promise<AxiosInstance>[] = [];

  /**
   * This function resets the cache, axiosInstance, and defaultOptions to their default values.
   */
  function resetConfigure() {
    cache = new LRUCache({ max: 500 });
    axiosInstance = StaticAxios;
    defaultOptions = DEFAULT_OPTIONS;
  }

  /**
   * This function allows to provide custom instances of cache and axios and to override the default options.
   * @param config The config object.
   */
  function configure(config: AxiosHooksConfig = {}) {
    if (config.axios !== undefined) {
      axiosInstance = config.axios;
    }

    if (config.cache !== undefined) {
      cache = config.cache;
    }

    if (config.defaultOptions !== undefined) {
      defaultOptions = { ...DEFAULT_OPTIONS, ...config.defaultOptions };
    }
  }

  resetConfigure();
  configure(config);

  /**
   * The `useAxios` hook allows to easily execute HTTP requests using axios.
   * @param config The config object or string to be used by axios.
   * @param options The options object to be used by the hook.
   * @returns
   */
  const useAxios = <Res = any, Req = any, Err = any>(
    config: UseAxiosConfig<Req>,
    options: UseAxiosOptions = {}
  ) => {
    const _config = useDeepCompareMemo(() => configToObject(config), [config]);
    const _options = useDeepCompareMemo(
      () => ({ ...defaultOptions, ...options }),
      [options]
    );

    // if SSR is active
    if (isSsrActive(_options)) {
      // add the request to the SSR promise queue
      __ssrPromises.push(axiosInstance(_config));
    }
    // use the internal function to handle the request
    return useAxiosIntern<Res, Req, Err>(
      _config,
      _options,
      axiosInstance,
      cache
    );
  };

  return Object.assign(useAxios, {
      ...getUseAxiosCacheObject(cache, __ssrPromises),
      /**
       * Allows to provide custom instances of cache and axios and to override the default options.
       * @param config The config object.
       */
      configure,
      /**
       * Dumps the request-response cache, to use in server side rendering scenarios.
       * @return  A serializable representation of the request-response cache ready to be used by `loadCache`.
       */
      resetConfigure,
      /**
       * This array contains the promises that are created during SSR.
       * @internal
       */
      __ssrPromises,
    }
  );
}
