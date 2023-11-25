import { isAxiosError } from 'axios';
import { State } from '../types/State.type';
import { ACTIONS } from '../constants';
import { Action } from '../types/Action.type';

/**
 * This function is the reducer for the state.
 * @param state - The state.
 * @param action - The action.
 * @typeParam Res - The response type.
 * @typeParam Req - The request type.
 * @typeParam Err - The error type.
 * @internal
 */
export function reducer<Res, Req, Err>(
  state: State<Res, Req, Err>,
  action: Action<Res, Req, Err>
): State<Res, Req, Err> {
  switch (action.type) {
    // The reducer function takes the state and an action as arguments
    // and returns a new state object. The state object should be
    // treated as immutable.
    case ACTIONS.REQUEST_START:
      // When the request starts, set loading to true and clear any errors
      return {
        ...state,
        loading: true,
        error: null,
      };
    case ACTIONS.REQUEST_END:
      // If the action payload is an axios error, set the error property
      // and clear the response and data properties.
      if (isAxiosError<Err, Req>(action.payload)) {
        return {
          loading: false,
          error: action.payload,
          response: null,
          data: null,
        };
      }
      // Otherwise set the loading property to false and set the response
      // and data properties to the action payload.
      return {
        loading: false,
        data: action.payload?.data ?? null,
        response: action.payload ?? null,
        error: null,
      };
    default:
      return state;
  }
}
