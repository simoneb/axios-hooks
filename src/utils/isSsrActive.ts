import { UseAxiosOptions } from "../types";

export function isSsrActive(options: UseAxiosOptions) {
  return typeof window === 'undefined' && options.ssr && !options.manual
}
