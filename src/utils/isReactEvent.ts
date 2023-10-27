import type { BaseSyntheticEvent } from 'react';
/**
 * This function checks if the given object is a React event.
 * @param obj - The object to check.
 * @internal
 */
export function isReactEvent(obj: any): obj is BaseSyntheticEvent {
  return obj && obj.nativeEvent && obj.nativeEvent instanceof Event;
}
