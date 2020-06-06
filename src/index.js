import React from 'react'
import StaticAxios from 'axios'
import LRU from 'lru-cache'

const actions = {
  REQUEST_START: 'REQUEST_START',
  REQUEST_END: 'REQUEST_END'
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

function createCacheKey(config) {
  const cleanedConfig = { ...config }
  delete cleanedConfig.cancelToken

  return JSON.stringify(cleanedConfig)
}

export function makeUseAxios(configurationOptions) {
  let cache
  let axiosInstance

  const __ssrPromises = []

  function resetConfigure() {
    cache = new LRU()
    axiosInstance = StaticAxios
  }

  function configure(options = {}) {
    if (options.axios !== undefined) {
      axiosInstance = options.axios
    }

    if (options.cache !== undefined) {
      cache = options.cache
    }
  }

  resetConfigure()
  configure(configurationOptions)

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
      if (StaticAxios.isCancel(err)) {
        return
      }

      dispatch({ type: actions.REQUEST_END, payload: err, error: true })
      throw err
    }
  }

  async function request(config, options, dispatch) {
    return (
      tryGetFromCache(config, options, dispatch) ||
      executeRequest(config, dispatch)
    )
  }

  function useAxios(config, options) {
    if (typeof config === 'string') {
      config = {
        url: config
      }
    }

    const stringifiedConfig = JSON.stringify(config)

    options = { manual: false, useCache: true, ...options }

    const cancelSourceRef = React.useRef()

    const [state, dispatch] = React.useReducer(
      reducer,
      createInitialState(config, options)
    )

    if (typeof window === 'undefined' && !options.manual) {
      useAxios.__ssrPromises.push(axiosInstance(config))
    }

    React.useEffect(() => {
      cancelSourceRef.current = StaticAxios.CancelToken.source()

      if (!options.manual) {
        request(
          { cancelToken: cancelSourceRef.current.token, ...config },
          options,
          dispatch
        ).catch(() => {})
      }

      return () => cancelSourceRef.current.cancel()
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [stringifiedConfig])

    const refetch = React.useCallback(
      (configOverride, options) => {
        return request(
          {
            cancelToken: cancelSourceRef.current.token,
            ...config,
            ...configOverride
          },
          { useCache: false, ...options },
          dispatch
        )
      },
      // eslint-disable-next-line react-hooks/exhaustive-deps
      [stringifiedConfig]
    )

    return [state, refetch]
  }
}
