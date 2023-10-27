import { Action } from './Action.type';
import { State } from './State.type';

export type Reducer<Res, Req, Err> = (
  state: State<Res, Req, Err>,
  action: Action<Res, Req, Err>
) => State<Res, Req, Err>;
