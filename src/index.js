import React from 'react'
import StaticAxios from 'axios'
import LRU from 'lru-cache'
import { dequal as deepEqual } from 'dequal/lite'

const actions = {
  REQUEST_START: 'REQUEST_START',
  REQUEST_END: 'REQUEST_END'
}

const DEFAULT_OPTIONS = {
  manual: false,
  useCache: true,
  ssr: true,
  autoCancel: true
}

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

export function makeUseAxios(configureOptions) {
  let cache
  let axiosInstance
  let defaultOptions

  const __ssrPromises = []

  function resetConfigure() {
    cache = new LRU()
    axiosInstance = StaticAxios
    defaultOptions = DEFAULT_OPTIONS
  }

  function configure(options = {}) {
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
    cache.reset()
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

  function createInitialState(config, options) {
    const response = !options.manual && tryGetFromCache(config, options)

    return {
      loading: !options.manual && !response,
      error: null,
      ...(response ? { data: response.data, response } : null)
    }
  }

  function reducer(state, action) {
    switch (action.type) {
      case actions.REQUEST_START:
        return {
          ...state,
          loading: true,
          error: null
        }
      case actions.REQUEST_END:
        return {
          ...state,
          loading: false,
          ...(action.error ? {} : { data: action.payload.data }),
          [action.error ? 'error' : 'response']: action.payload
        }
    }
  }

  function tryGetFromCache(config, options, dispatch) {
    if (!cache || !options.useCache) {
      return
    }

    const cacheKey = createCacheKey(config)
    const response = cache.get(cacheKey)

    if (response && dispatch) {
      dispatch({ type: actions.REQUEST_END, payload: response })
    }

    return response
  }

  async function executeRequest(config, dispatch) {
    try {
      dispatch({ type: actions.REQUEST_START })

      const response = await axiosInstance(config)

      tryStoreInCache(config, response)

      dispatch({ type: actions.REQUEST_END, payload: response })

      return response
    } catch (err) {
      if (!StaticAxios.isCancel(err)) {
        dispatch({ type: actions.REQUEST_END, payload: err, error: true })
      }

      throw err
    }
  }

  async function request(config, options, dispatch) {
    return (
      tryGetFromCache(config, options, dispatch) ||
      executeRequest(config, dispatch)
    )
  }

  function useAxios(_config, _options) {
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

    const cancelSourceRef = React.useRef()

    const [state, dispatch] = React.useReducer(
      reducer,
      createInitialState(config, options)
    )

    if (typeof window === 'undefined' && options.ssr && !options.manual) {
      useAxios.__ssrPromises.push(axiosInstance(config))
    }

    const cancelOutstandingRequest = React.useCallback(() => {
      if (cancelSourceRef.current) {
        cancelSourceRef.current.cancel()
      }
    }, [])

    const withCancelToken = React.useCallback(
      config => {
        if (options.autoCancel) {
          cancelOutstandingRequest()
        }

        cancelSourceRef.current = StaticAxios.CancelToken.source()

        config.cancelToken = cancelSourceRef.current.token

        return config
      },
      [cancelOutstandingRequest, options.autoCancel]
    )

    React.useEffect(() => {
      if (!options.manual) {
        request(withCancelToken(config), options, dispatch).catch(() => {})
      }

      return cancelOutstandingRequest
    }, [config, options, withCancelToken, cancelOutstandingRequest])

    const refetch = React.useCallback(
      (configOverride, options) => {
        configOverride = configToObject(configOverride)

        return request(
          withCancelToken({
            ...config,
            ...(isReactEvent(configOverride) ? null : configOverride)
          }),
          { useCache: false, ...options },
          dispatch
        )
      },
      [config, withCancelToken]
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
