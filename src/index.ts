import React from 'react'
import StaticAxios, { AxiosError, isAxiosError, isCancel } from 'axios'
import { LRUCache } from 'lru-cache'
import { dequal as deepEqual } from 'dequal/lite'
import type { AxiosHooksConfig } from './types/AxiosHooksConfig.type'
import { ACTIONS, DEFAULT_OPTIONS } from './constants'
import { reducer } from './state/reducer'
import { createInitialState } from './state/createInitialState'
import { UseAxiosResult } from './types'

const useAxios = makeUseAxios()

const {
  __ssrPromises,
  resetConfigure,
  configure,
  loadCache,
  serializeCache,
  clearCache
} = useAxios

export default useAxios

export {
  __ssrPromises,
  resetConfigure,
  configure,
  loadCache,
  serializeCache,
  clearCache
}

function isReactEvent(obj) {
  return obj && obj.nativeEvent && obj.nativeEvent instanceof Event
}

function createCacheKey(config) {
  const cleanedConfig = { ...config }
  delete cleanedConfig.cancelToken

  return JSON.stringify(cleanedConfig)
}

function configToObject(config) {
  if (typeof config === 'string') {
    return {
      url: config
    }
  }

  return Object.assign({}, config)
}

export function makeUseAxios(configureOptions?: AxiosHooksConfig) {
  /**
   * @type {import('lru-cache')}
   */
  let cache
  let axiosInstance
  let defaultOptions

  const __ssrPromises = []

  function resetConfigure() {
    cache = new LRUCache({ max: 500 })
    axiosInstance = StaticAxios
    defaultOptions = DEFAULT_OPTIONS
  }

  function configure(options: AxiosHooksConfig = {}) {
    if (options.axios !== undefined) {
      axiosInstance = options.axios
    }

    if (options.cache !== undefined) {
      cache = options.cache
    }

    if (options.defaultOptions !== undefined) {
      defaultOptions = { ...DEFAULT_OPTIONS, ...options.defaultOptions }
    }
  }

  resetConfigure()
  configure(configureOptions)

  function loadCache(data) {
    cache.load(data)
  }

  async function serializeCache() {
    const ssrPromisesCopy = [...__ssrPromises]

    __ssrPromises.length = 0

    await Promise.all(ssrPromisesCopy)

    return cache.dump()
  }

  function clearCache() {
    cache.clear()
  }

  return Object.assign(useAxios, {
    __ssrPromises,
    resetConfigure,
    configure,
    loadCache,
    serializeCache,
    clearCache
  })

  function tryStoreInCache(config, response) {
    if (!cache) {
      return
    }

    const cacheKey = createCacheKey(config)

    const responseForCache = { ...response }
    delete responseForCache.config
    delete responseForCache.request

    cache.set(cacheKey, responseForCache)
  }

  function tryGetFromCache(config, options, dispatch?) {
    if (!cache || !options.useCache) {
      return
    }

    const cacheKey = createCacheKey(config)
    const response = cache.get(cacheKey)

    if (response && dispatch) {
      dispatch({ type: ACTIONS.REQUEST_END, payload: response })
    }

    return response
  }

  async function executeRequest(config, dispatch) {
    try {
      dispatch({ type: ACTIONS.REQUEST_START })

      const response = await axiosInstance(config)

      tryStoreInCache(config, response)

      dispatch({ type: ACTIONS.REQUEST_END, payload: response })

      return response
    } catch (err) {
      let _err = err
      if (isAxiosError(err)) {
        if (!isCancel(err)) {
          dispatch({ type: ACTIONS.REQUEST_END, payload: err })
        }
      } else {
        _err = AxiosError.from(err, 'ERR_AXIOS_HOOKS', config)
        dispatch({
          type: ACTIONS.REQUEST_END,
          payload: _err
        })
      }

      throw _err
    }
  }

  async function request(config, options, dispatch) {
    return (
      tryGetFromCache(config, options, dispatch) ||
      executeRequest(config, dispatch)
    )
  }

  function useAxios(_config, _options?): UseAxiosResult {
    const config = React.useMemo(
      () => configToObject(_config),
      // eslint-disable-next-line react-hooks/exhaustive-deps
      useDeepCompareMemoize(_config)
    )

    const options = React.useMemo(
      () => ({ ...defaultOptions, ..._options }),
      // eslint-disable-next-line react-hooks/exhaustive-deps
      useDeepCompareMemoize(_options)
    )

    const abortControllerRef = React.useRef<AbortController>()

    const [state, dispatch] = React.useReducer(
      reducer,
      createInitialState(config, options, tryGetFromCache)
    )

    if (typeof window === 'undefined' && options.ssr && !options.manual) {
      (useAxios as any).__ssrPromises.push(axiosInstance(config))
    }

    const cancelOutstandingRequest = React.useCallback(() => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }, [])

    const withAbortSignal = React.useCallback(
      config => {
        if (options.autoCancel) {
          cancelOutstandingRequest()
        }

        abortControllerRef.current = new AbortController()

        config.signal = abortControllerRef.current.signal

        return config
      },
      [cancelOutstandingRequest, options.autoCancel]
    )

    React.useEffect(() => {
      if (!options.manual) {
        request(withAbortSignal(config), options, dispatch).catch(() => { })
      }

      return () => {
        if (options.autoCancel) {
          cancelOutstandingRequest()
        }
      }
    }, [config, options, withAbortSignal, cancelOutstandingRequest])

    const refetch = React.useCallback(
      (configOverride, options?) => {
        configOverride = configToObject(configOverride)

        return request(
          withAbortSignal({
            ...config,
            ...(isReactEvent(configOverride) ? null : configOverride)
          }),
          { useCache: false, ...options },
          dispatch
        )
      },
      [config, withAbortSignal]
    )

    return [state, refetch, cancelOutstandingRequest]
  }
}

function useDeepCompareMemoize(value) {
  const ref = React.useRef()
  const signalRef = React.useRef(0)

  if (!deepEqual(value, ref.current)) {
    ref.current = value
    signalRef.current += 1
  }

  return [signalRef.current]
}
