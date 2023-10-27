import type { AxiosResponse } from 'axios';

/**
 * The response returned by axios-hooks.
 * Note: The config and request properties are removed from the axios request.
 * @typeParam Res - The expected response type.
 */
export type UseAxiosResponse<Res = any> = Omit<AxiosResponse<Res>, 'config' | 'request'>;
