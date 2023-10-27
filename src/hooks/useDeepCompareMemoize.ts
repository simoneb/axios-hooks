import React from 'react';
import { dequal as deepEqual } from 'dequal/lite';

/**
 * This code checks to see if the list of dependencies passed to the React hook are empty.
 * If they are empty, it throws an error.
 * @param deps - The dependencies to check.
 * @param name - The name of the hook.
 */
export function checkDeps(deps: React.DependencyList, name: string) {
  // This is the actual hook that people should use.
  const reactHookName = `React.${name.replace(/DeepCompare/, '')}`;

  // If there are no dependencies, then the hook will never re-run,
  // so we don't need to wrap it in a memo.
  if (!deps || deps.length === 0) {
    throw new Error(
      `${name} should not be used with no dependencies. Use ${reactHookName} instead.`
    );
  }
}

/**
 * This code is used to memoize the value of the value variable using deep comparison.
 * The memoize function is used to cache the results of the deepEqual function.
 * @param value - The value to memoize.
 * @internal
 */
export function useDeepCompareMemoize(value: React.DependencyList) {
  // 1. Create a new ref to store the value
  const ref = React.useRef<React.DependencyList>([]);

  // 2. Check if the value has changed
  if (!deepEqual(value, ref.current)) {
    // 3. Update the ref with the new value
    ref.current = value;
  }

  // 4. Return the ref's current value
  return ref.current;
}
