import {
  AxiosError,
  AxiosInstance,
  AxiosRequestConfig,
  isAxiosError,
  isCancel
} from 'axios'

import { ACTIONS } from './../constants'
import { tryStoreInCache } from './../utils/cache'
import { UseAxiosCache } from '../types/UseAxiosCache.type'
import { UseAxiosResponse } from '../types/UseAxiosResponse.type'
import { Dispatch } from '../types/Dispatch.type'
import { isError } from '../utils/isError'

/**
 * This function executes the request and dispatches the appropriate actions.
 * @param config - The request config to pass to axiosInstance.
 * @param dispatch - The dispatch function.
 * @param cache - The cache.
 * @param axiosInstance - The axios instance.
 * @typeParam Res - The response type.
 * @typeParam Req - The request type.
 * @typeParam Err - The error type.
 * @internal
 */
export async function executeRequest<Res, Req, Err>(
  config: AxiosRequestConfig<Req>,
  dispatch: Dispatch<Res, Req, Err>,
  cache: UseAxiosCache,
  axiosInstance: AxiosInstance
): Promise<UseAxiosResponse<Res>> {
  try {
    dispatch({ type: ACTIONS.REQUEST_START })

    const {
      config: _config,
      request,
      ...response
    } = await axiosInstance(config)

    tryStoreInCache(config, response, cache)

    dispatch({ type: ACTIONS.REQUEST_END, payload: response })

    return response
  } catch (err) {
    if (isError(err)) {
      if (isAxiosError<Err, Req>(err) && !isCancel(err)) {
        const _err = err as AxiosError<Err, Req>
        dispatch({ type: ACTIONS.REQUEST_END, payload: _err })
      }
      dispatch({ type: ACTIONS.REQUEST_END, payload: err })
    }
    throw err
  }
}
