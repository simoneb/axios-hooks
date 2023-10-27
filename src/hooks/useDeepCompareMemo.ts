import React from 'react';
import { checkDeps, useDeepCompareMemoize } from './useDeepCompareMemoize';

/**
 * `useDeepCompareMemo` will only recompute the memoized value when one of the `deps` has changed.
 *
 * Usage note: only use this if `deps` are objects or arrays that contain objects.
 * Otherwise you should just use React.useMemo.
 * @param factory - The function to memoize.
 * @param dependencies - The dependencies to check.
 * @internal
 */
function useDeepCompareMemo<T>(
  factory: () => T,
  dependencies: React.DependencyList
) {

  if (process.env.NODE_ENV !== 'production') {
    checkDeps(dependencies, 'useDeepCompareMemo');
  }
  
  // This is the hook's dependencies array. We'll pass it to the memoizer
  // to determine if the hook's factory should be re-run.
  const memoized = useDeepCompareMemoize(dependencies);

  // We use useMemo to memoize the factory itself, and only re-run it
  // if the memoized dependencies change.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  return React.useMemo(factory, memoized);
}

export default useDeepCompareMemo;
