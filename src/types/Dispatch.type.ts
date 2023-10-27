import { Action } from './Action.type';

export type Dispatch<Res, Req, Err> = (action: Action<Res, Req, Err>) => void;
