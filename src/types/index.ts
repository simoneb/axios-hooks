// TODO: clean up this file
import type { AxiosError, AxiosPromise, AxiosRequestConfig, AxiosResponse } from "axios"

export interface ResponseValues<TResponse, TBody, TError> {
    data?: TResponse
    loading: boolean
    error: AxiosError<TError, TBody> | null
    response?: AxiosResponse<TResponse, TBody>
  }
  
  export interface RefetchOptions {
    useCache?: boolean
  }
  
  export interface RefetchFunction<TBody, TResponse> {
    (
      config?: AxiosRequestConfig<TBody> | string,
      options?: RefetchOptions
    ): AxiosPromise<TResponse>
    (e: Event): AxiosPromise<TResponse>
  }
  
  export type UseAxiosResult<TResponse = any, TBody = any, TError = any> = [
    ResponseValues<TResponse, TBody, TError>,
    RefetchFunction<TBody, TResponse>,
    () => void
  ]