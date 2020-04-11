import React from 'react'
import StaticAxios from 'axios'
import LRU from 'lru-cache'

const actions = {
  REQUEST_START: 'REQUEST_START',
  REQUEST_END: 'REQUEST_END'
}

const defaultUseAxios = makeUseAxios()

const {
  __ssrPromises,
  resetConfigure,
  configure,
  loadCache,
  serializeCache
} = defaultUseAxios

export default defaultUseAxios

export { __ssrPromises, resetConfigure, configure, loadCache, serializeCache }

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

  return Object.assign(useAxios, {
    __ssrPromises,
    resetConfigure,
    configure,
    loadCache,
    serializeCache
  })

  async function cacheAdapter(config) {
    const cacheKey = JSON.stringify(config)
    const hit = cache.get(cacheKey)

    if (hit) {
      return hit
    }

    delete config.adapter

    const response = await axiosInstance(config)

    const responseForCache = { ...response }
    delete responseForCache.config
    delete responseForCache.request

    cache.set(cacheKey, responseForCache)

    return response
  }

  function createInitialState(options) {
    return {
      loading: !options.manual
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
      default:
        return state
    }
  }

  async function request(config, dispatch) {
    try {
      dispatch({ type: actions.REQUEST_START })
      const response = await axiosInstance(config)
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

  function executeRequestWithCache(config, dispatch) {
    return request({ ...config, adapter: cacheAdapter }, dispatch)
  }

  function executeRequestWithoutCache(config, dispatch) {
    return request(config, dispatch)
  }

  function executeRequest(config, options, dispatch) {
    if (cache && options.useCache) {
      return executeRequestWithCache(config, dispatch)
    }

    return executeRequestWithoutCache(config, dispatch)
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
      createInitialState(options)
    )

    if (typeof window === 'undefined' && !options.manual) {
      useAxios.__ssrPromises.push(
        axiosInstance({ ...config, adapter: cacheAdapter })
      )
    }

    React.useEffect(() => {
      cancelSourceRef.current = StaticAxios.CancelToken.source()

      if (!options.manual) {
        executeRequest(
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
        return executeRequest(
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
