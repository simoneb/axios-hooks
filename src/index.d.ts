import {
  AxiosRequestConfig,
  AxiosError,
  AxiosPromise,
  AxiosStatic,
  AxiosInstance,
  AxiosResponse
} from 'axios'
import LRUCache from 'lru-cache'

export interface ResponseValues<T> {
  data?: T
  loading: boolean
  error?: AxiosError
  response?: AxiosResponse
}

export interface Options {
  manual?: boolean
  useCache?: boolean
}

export interface RefetchOptions {
  useCache?: boolean
}

export interface ConfigureOptions {
  axios?: AxiosInstance | AxiosStatic | any
  cache?: LRUCache<any, any> | false
}

export interface CancellationReasons {
  NEW_REQUEST: string
  UNMOUNTED: string
}

export interface UseAxios {
  <T = any>(config: AxiosRequestConfig | string, options?: Options): [
    ResponseValues<T>,
    (config?: AxiosRequestConfig, options?: RefetchOptions) => AxiosPromise<T>
  ]

  loadCache(data: any[]): void
  serializeCache(): Promise<any[]>

  configure(options: ConfigureOptions): void
  resetConfigure(): void
  clearCache(): void

  // private
  __ssrPromises: Promise<any>[]
  __cancellationReasons: CancellationReasons
}

declare const useAxios: UseAxios

export default useAxios

export function loadCache(data: any[]): void
export function serializeCache(): Promise<any[]>
export function clearCache(): void

export function configure(options: ConfigureOptions): void
export function resetConfigure(): void

// private
export const __ssrPromises: Promise<any>[]
export const __cancellationReasons: CancellationReasons

export function makeUseAxios(options: ConfigureOptions): UseAxios
