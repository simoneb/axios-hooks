import { ActionsObject } from './types/Action.type';
import { UseAxiosOptions } from './types/UseAxiosOptions.type';

/**
 * This object contains the actions.
 */
export const ACTIONS: ActionsObject = {
  REQUEST_START: 'REQUEST_START',
  REQUEST_END: 'REQUEST_END',
};

/**
 * This object contains the default options.
 */
export const DEFAULT_OPTIONS: UseAxiosOptions = {
  manual: false,
  useCache: true,
  ssr: true,
  autoCancel: true,
};
