import { AxiosRequestConfig, AxiosError, AxiosPromise } from 'axios'

interface ResponseValues {
  data: any;
  loading: boolean;
  error?: AxiosError;
}

interface Options {
  manual: boolean
}

export default function useAxios(
  config: AxiosRequestConfig | string,
  options?: Options
): [ResponseValues, (config?: AxiosRequestConfig) => void]
