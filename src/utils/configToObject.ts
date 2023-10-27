import { AxiosRequestConfig } from 'axios';
import { UseAxiosConfig } from '../types/UseAxiosConfig.type';

/**
 * This function converts the config to an object.
 * @param config - The config.
 * @typeParam Req - The request type.
 * @internal
 */
export function configToObject<Req>(
  config: UseAxiosConfig<Req>
): AxiosRequestConfig<Req> {
  if (typeof config === 'string') {
    return {
      url: config,
    };
  }

  return Object.assign({}, config);
}
