import { makeUseAxios } from "./makeUseAxios";

/**
 * The `useAxios` hook allows to easily execute HTTP requests using axios.
 * @param config The request URL or `config` object, the same argument accepted by axios.
 * @param options The options object to be used by the hook.
 * @function
 */
const useAxios = makeUseAxios()

const {
  __ssrPromises,
  resetConfigure,
  configure,
  loadCache,
  serializeCache,
  clearCache
} = useAxios

export default useAxios

export * from './types';
export {
  __ssrPromises,
  resetConfigure,
  configure,
  loadCache,
  serializeCache,
  clearCache,
  makeUseAxios
}
