import type { AxiosRequestConfig } from 'axios';

/**
 * The `useAxios` configuration type.
 * @typeParam Req The request body type.
 */
export type UseAxiosConfig<Req> = AxiosRequestConfig<Req> | string;
