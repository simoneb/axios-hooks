import { AxiosRequestConfig, AxiosError, AxiosPromise } from 'axios'

interface ResponseValues {
  data: any;
  loading: boolean;
  error?: AxiosError;
}

export default function useAxios(
  config: AxiosRequestConfig | string
): [ResponseValues, () => void]
