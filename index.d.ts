import { AxiosRequestConfig, AxiosError, AxiosPromise } from 'axios'

interface ResponseValues<T> {
  data: T
  loading: boolean
  error?: AxiosError
}

interface Options {
  manual: boolean
}

interface RefetchOptions {
  useCache: boolean
}

export default function useAxios<T = any>(
  config: AxiosRequestConfig | string,
  options?: Options
): [
  ResponseValues<T>,
  (config?: AxiosRequestConfig, options?: RefetchOptions) => void
]
