import { AxiosError } from "axios";
import { UseAxiosResponse } from "./UseAxiosResponse.type";

export type Actions = 'REQUEST_START' | 'REQUEST_END';
export type ActionsObject = Record<Actions, Actions>;
export type Action<Res, Req, Err> = {
    type: Actions;
    payload?: UseAxiosResponse<Res> | AxiosError<Err, Req> | null;
}
