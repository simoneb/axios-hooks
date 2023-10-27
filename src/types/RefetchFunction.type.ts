import type { BaseSyntheticEvent } from 'react';
import { UseAxiosConfig } from "./UseAxiosConfig.type";
import { UseAxiosOptions } from "./UseAxiosOptions.type";
import { UseAxiosResponse } from "./UseAxiosResponse.type";

/**
 * The useAxios refetch function type. This function is returned by the `useAxios` hook.
 * It allows to refetch the request manually.
 */
export type RefetchFunction<Res, Req> = (
  config: UseAxiosConfig<Req> | BaseSyntheticEvent,
  options?: UseAxiosOptions
) => Promise<UseAxiosResponse<Res>>;
