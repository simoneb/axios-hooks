import {
  AxiosRequestConfig,
  AxiosError,
  AxiosPromise,
  AxiosStatic,
  AxiosInstance,
  AxiosResponse
} from "axios";
import LRUCache from "lru-cache";

interface ResponseValues<T> {
  data: T;
  loading: boolean;
  error?: AxiosError;
  response?: AxiosResponse;
}

interface Options {
  manual?: boolean;
  useCache?: boolean;
}

interface RefetchOptions {
  useCache?: boolean;
}

interface ConfigureOptions {
  axios?: AxiosInstance | AxiosStatic | any;
  cache?: LRUCache<any, any>;
}

export default function useAxios<T = any>(
  config: AxiosRequestConfig | string,
  options?: Options
): [
  ResponseValues<T>,
  (config?: AxiosRequestConfig, options?: RefetchOptions) => void
];

export function configure(options: ConfigureOptions): void;
export function resetConfigure(): void;
