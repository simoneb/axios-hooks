import { AxiosError } from 'axios'
import { UseAxiosResponse } from './UseAxiosResponse.type'

/**
 * Represents the state of a request made using `axios-hooks`.
 */
export type Actions = 'REQUEST_START' | 'REQUEST_END'
/**
 * Represents the state of a request made using `axios-hooks`.
 */
export type ActionsObject = Record<Actions, Actions>
/**
 * Represents the state of a request made using `axios-hooks`.
 */
export type Action<Res, Req, Err> = {
  /**
   * The action type.
   */
  type: Actions
  /**
   * The action payload.
   */
  payload?: UseAxiosResponse<Res> | AxiosError<Err, Req>;
}
