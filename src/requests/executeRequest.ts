import { AxiosError, AxiosInstance, AxiosRequestConfig, isCancel } from 'axios'

import { ACTIONS } from './../constants'
import { tryStoreInCache } from './../utils/cache'
import { UseAxiosCache } from '../types/UseAxiosCache.type'
import { UseAxiosResponse } from '../types/UseAxiosResponse.type'
import { Dispatch } from '../types/Dispatch.type'

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

    const response = await axiosInstance(config)
    const cloned: UseAxiosResponse<Res> & { request?: any; config?: any } = {
      ...response
    }
    if (cloned.request) delete cloned.request
    if (cloned.config) delete cloned.config

    tryStoreInCache(config, cloned, cache)

    dispatch({ type: ACTIONS.REQUEST_END, payload: cloned })

    return cloned
  } catch (err) {
    if (!isCancel(err)) {
      const _err = err as AxiosError<Err, Req>
      dispatch({ type: ACTIONS.REQUEST_END, payload: _err })
    }
    throw err
  }
}
