import { useEffect, useRef, useState } from 'react';

/**
 * Tiny data-loading hook. Re-runs when `deps` change or when reload() is called.
 * Old data stays visible while reloading, so lists do not flash empty after an action.
 */
export function useAsync(fn, deps = []) {
  const [state, setState] = useState({ loading: true, data: null, error: '' });
  const [tick, setTick] = useState(0);
  const fnRef = useRef(fn);
  fnRef.current = fn;

  useEffect(() => {
    let live = true;
    setState((s) => ({ ...s, loading: true, error: '' }));
    fnRef
      .current()
      .then((data) => live && setState({ loading: false, data, error: '' }))
      .catch((e) => live && setState({ loading: false, data: null, error: e.message || 'Something went wrong.' }));
    return () => {
      live = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, tick]);

  return { ...state, reload: () => setTick((t) => t + 1) };
}
