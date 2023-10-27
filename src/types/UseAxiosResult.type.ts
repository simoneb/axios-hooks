import { CancelFn } from "./Cancel.type";
import { RefetchFunction } from "./RefetchFunction.type";
import { State } from "./State.type";

/**
 * The `useAxios` hook result type.
 * @typeParam Res The response body type.
 * @typeParam Req The request body type.
 * @typeParam Err The error body type.
 */
export type UseAxiosResult<Res = any, Req = any, Err = any> = [
  State<Res, Req, Err>,
  RefetchFunction<Res, Req>,
  CancelFn
];
