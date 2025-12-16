import { useCallback, useMemo, useRef, useState } from 'react';

export interface StableActions<K> {
  add: (key: K) => void;
  remove: (key: K) => void;
  toggle: (key: K) => void;
  reset: () => void;
  clear: () => void;
}

export interface Actions<K> extends StableActions<K> {
  has: (key: K) => boolean;
}

const useSet = <K>(initialSet = new Set<K>()): [Set<K>, Actions<K>] => {
  const setRef = useRef(new Set(initialSet));
  const [, rerender] = useState(0);

  const stableActions = useMemo<StableActions<K>>(() => {
    const add = (item: K) => {
      if (!setRef.current.has(item)) {
        setRef.current.add(item);
        rerender((c: number) => c + 1);
      }
    };
    const remove = (item: K) => {
      if (setRef.current.delete(item)) {
        rerender((c: number) => c + 1);
      }
    };
    const toggle = (item: K) => {
      if (setRef.current.has(item)) {
        setRef.current.delete(item);
      } else {
        setRef.current.add(item);
      }
      rerender((c: number) => c + 1);
    };
    const reset = () => {
      setRef.current = new Set(initialSet);
      rerender((c: number) => c + 1);
    };
    const clear = () => {
      if (setRef.current.size > 0) {
        setRef.current.clear();
        rerender((c: number) => c + 1);
      }
    };

    return { add, remove, toggle, reset, clear };
  }, []);

  const utils = {
    has: useCallback((item: K) => setRef.current.has(item), []),
    ...stableActions,
  } as Actions<K>;

  return [new Set(setRef.current), utils];
};

export default useSet;
