import { AxiosStatic } from "axios";

declare module "axios" {
  interface AxiosStatic {
    mockResolvedValue: Function;
    mockResolvedValueOnce: Function;
    mockRejectedValue: Function;
  }
}
