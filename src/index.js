import React from 'react'
import DefaultAxios from 'axios'
import LRU from 'lru-cache'

const actions = {
  REQUEST_START: 'REQUEST_START',
  REQUEST_END: 'REQUEST_END'
}

const ssrPromises = []

let cache = new LRU()
let axiosInstance = DefaultAxios

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
  await Promise.all(ssrPromises)

  ssrPromises.length = 0

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
        loading: true
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
  } catch (err) {
    dispatch({ type: actions.REQUEST_END, payload: err, error: true })
  }
}

function executeRequestWithCache(config, dispatch) {
  request({ ...config, adapter: cacheAdapter }, dispatch)
}

function executeRequestWithoutCache(config, dispatch) {
  return request(config, dispatch)
}

export default function useAxios(config, options = { manual: false }) {
  if (typeof config === 'string') {
    config = {
      url: config
    }
  }

  const [state, dispatch] = React.useReducer(
    reducer,
    createInitialState(options)
  )

  if (typeof window === 'undefined') {
    ssrPromises.push(axiosInstance({ ...config, adapter: cacheAdapter }))
  }

  React.useEffect(() => {
    if (!options.manual) {
      executeRequestWithCache(config, dispatch)
    }
  }, [JSON.stringify(config)])

  return [
    state,
    configOverride => {
      return executeRequestWithoutCache(
        { ...config, ...configOverride },
        dispatch
      )
    }
  ]
}
