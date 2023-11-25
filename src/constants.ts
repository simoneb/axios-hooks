import { ActionsObject } from './types/Action.type';
import { UseAxiosOptions } from './types/UseAxiosOptions.type';

/**
 * This object contains the actions.
 */
export const ACTIONS: ActionsObject = {
  /**
   * This action is dispatched when the request starts.
   */
  REQUEST_START: 'REQUEST_START',
  /**
   * This action is dispatched when the request ends.
   */
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
