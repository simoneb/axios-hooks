import { AxiosError } from "axios";
import { UseAxiosResponse } from "./UseAxiosResponse.type";

/**
 * Represents the state of a request made using `axios-hooks`.
 * @typeParam Req - The request body data type.
 * @typeParam Res - The response data type.
 */
export type State<Res, Req, Err> = {
  /**
   * True if the request is in progress, otherwise False.
   */
  loading: boolean;
  /**
   *  The success response data property (for convenient access).
   */
  data: Res | null;
  /**
   * The error value.
   */
  error: AxiosError<Err, Req> | null;
  /**
   * The whole success response object.
   */
  response: UseAxiosResponse<Res> | null;
};
