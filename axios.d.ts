import { AxiosStatic } from "axios";

declare module "axios" {
  interface AxiosStatic {
    mockImplementation: Function;
    mockResolvedValue: Function;
    mockResolvedValueOnce: Function;
    mockRejectedValue: Function;
  }
}
