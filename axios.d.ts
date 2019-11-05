import { AxiosStatic } from "axios";

declare module "axios" {
  interface AxiosStatic {
    mockReset: Function;
    mockImplementationOnce: Function;
    mockImplementation: Function;
    mockResolvedValue: Function;
    mockResolvedValueOnce: Function;
    mockRejectedValue: Function;
  }
}
