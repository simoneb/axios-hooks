import React from 'react'
import axios from 'axios'
import LRU from 'lru-cache'

const actions = {
  REQUEST_START: 'REQUEST_START',
  REQUEST_END: 'REQUEST_END'
}

const initialState = {
  loading: false
}

const ssrPromises = []

export const cache = new LRU()

export const serializeCache = async () => {
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

  const response = await axios(config)

  const responseForCache = { ...response }
  delete responseForCache.config
  delete responseForCache.request

  cache.set(cacheKey, responseForCache)

  return response
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
    const response = await axios(config)
    dispatch({ type: actions.REQUEST_END, payload: response })
  } catch (err) {
    dispatch({ type: actions.REQUEST_END, payload: err, error: true })
  }
}

export default function useAxios(config) {
  if (typeof config === 'string') {
    config = {
      url: config
    }
  }

  const [state, dispatch] = React.useReducer(reducer, initialState)

  if (typeof window === 'undefined') {
    ssrPromises.push(axios({ ...config, adapter: cacheAdapter }))
  }

  React.useEffect(() => {
    request({ ...config, adapter: cacheAdapter }, dispatch)
  }, [JSON.stringify(config)])

  return [
    state,
    function refetch() {
      return request(config, dispatch)
    }
  ]
}
