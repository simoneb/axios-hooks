import {
  AxiosRequestConfig,
  AxiosError,
  AxiosPromise,
  AxiosStatic,
  AxiosInstance,
  AxiosResponse
} from 'axios'
import LRUCache from 'lru-cache'

interface ResponseValues<T> {
  data: T
  loading: boolean
  error?: AxiosError
  response?: AxiosResponse
}

interface Options {
  manual?: boolean
  useCache?: boolean
}

interface RefetchOptions {
  useCache?: boolean
}

interface ConfigureOptions {
  axios?: AxiosInstance | AxiosStatic | any
  cache?: LRUCache<any, any>
}

interface UseAxios<T = any> {
  (config: AxiosRequestConfig | string, options?: Options): [
    ResponseValues<T>,
    (config?: AxiosRequestConfig, options?: RefetchOptions) => AxiosPromise<T>
  ]

  loadCache(data: any[]): void
  serializeCache(): Promise<any[]>

  configure(options: ConfigureOptions): void
  resetConfigure(): void

  // private
  __ssrPromises: Promise<any>[]
}

declare const defaultUseAxios: UseAxios

export default defaultUseAxios

export function useAxios<T = any>(
  config: AxiosRequestConfig | string,
  options?: Options
): [
  ResponseValues<T>,
  (config?: AxiosRequestConfig, options?: RefetchOptions) => AxiosPromise<T>
]

export function loadCache(data: any[]): void
export function serializeCache(): Promise<any[]>

export function configure(options: ConfigureOptions): void
export function resetConfigure(): void

// private
export const __ssrPromises: Promise<any>[]

export function makeUseAxios(options: ConfigureOptions): UseAxios
