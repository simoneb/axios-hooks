import { RenderHookResult } from '@testing-library/react-hooks'

declare module '@testing-library/react-hooks' {
  interface RenderHookResult<P, R> {
    readonly wait: (callback: Function, options: Object) => Promise<void>
  }
}
