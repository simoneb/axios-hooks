export interface UseAxiosOptions {
  /**
   * If true, the request is not executed immediately.
   * Useful for non-GET requests that should not be executed when the component renders.
   * Use the execute function returned when invoking the hook to execute the request manually.
   */
  manual?: boolean;
  /**
   * Allows caching to be enabled/disabled for the hook.
   * It doesn't affect the execute function returned by the hook.
   */
  useCache?: boolean;
  /**
   * Enables or disables SSR support.
   */
  ssr?: boolean;
  /**
   * Enables or disables automatic cancellation of pending requests whether
   * it be from the automatic hook request or from the `manual` execute method.
   */
  autoCancel?: boolean;
}
