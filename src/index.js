import React from 'react'
import DefaultAxios from 'axios'
import LRU from 'lru-cache'

const actions = {
  REQUEST_START: 'REQUEST_START',
  REQUEST_END: 'REQUEST_END'
}

export const __ssrPromises = []

let cache
let axiosInstance

export function resetConfigure() {
  cache = new LRU()
  axiosInstance = DefaultAxios
}

resetConfigure()

export function configure(options) {
  if (options.axios) {
    axiosInstance = options.axios
  }

  if (options.cache) {
    cache = options.cache
  }
}

export function loadCache(data) {
  cache.load(data)
}

export async function serializeCache() {
  const ssrPromisesCopy = [...__ssrPromises]

  __ssrPromises.length = 0

  await Promise.all(ssrPromisesCopy)

  return cache.dump()
}

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
  if (options.useCache) {
    return executeRequestWithCache(config, dispatch)
  }

  return executeRequestWithoutCache(config, dispatch)
}

export default function useAxios(config, options) {
  if (typeof config === 'string') {
    config = {
      url: config
    }
  }

  const stringifiedConfig = JSON.stringify(config)

  options = { manual: false, useCache: true, ...options }

  const [state, dispatch] = React.useReducer(
    reducer,
    createInitialState(options)
  )

  if (typeof window === 'undefined' && !options.manual) {
    __ssrPromises.push(axiosInstance({ ...config, adapter: cacheAdapter }))
  }

  React.useEffect(() => {
    if (!options.manual) {
      executeRequest(config, options, dispatch).catch(() => {})
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stringifiedConfig])

  const refetch = React.useCallback(
    (configOverride, options) => {
      return executeRequest(
        { ...config, ...configOverride },
        { useCache: false, ...options },
        dispatch
      )
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [stringifiedConfig]
  )

  return [state, refetch]
}
