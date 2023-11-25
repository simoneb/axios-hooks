// TODO: clean up this file
import type { AxiosPromise, AxiosRequestConfig } from "axios"
import { State } from "./State.type"
  
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
    State<TResponse, TBody, TError>,
    RefetchFunction<TBody, TResponse>,
    () => void
  ]