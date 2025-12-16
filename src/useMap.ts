import { useCallback, useMemo, useRef, useState } from 'react';

export interface StableActions<T extends object> {
  set: <K extends keyof T>(key: K, value: T[K]) => void;
  setAll: (newMap: T) => void;
  remove: <K extends keyof T>(key: K) => void;
  reset: () => void;
}

export interface Actions<T extends object> extends StableActions<T> {
  get: <K extends keyof T>(key: K) => T[K];
}

const useMap = <T extends object = any>(initialMap: T = {} as T): [T, Actions<T>] => {
  const mapRef = useRef<T>({ ...initialMap });
  const [, rerender] = useState(0);

  const stableActions = useMemo<StableActions<T>>(
    () => ({
      set: <K extends keyof T>(key: K, entry: T[K]) => {
        mapRef.current = {
          ...mapRef.current,
          [key]: entry,
        };
        rerender((c: number) => c + 1);
      },
      setAll: (newMap: T) => {
        mapRef.current = newMap;
        rerender((c: number) => c + 1);
      },
      remove: <K extends keyof T>(key: K) => {
        const { [key]: omit, ...rest } = mapRef.current;
        mapRef.current = rest as T;
        rerender((c: number) => c + 1);
      },
      reset: () => {
        mapRef.current = { ...initialMap };
        rerender((c: number) => c + 1);
      },
    }),
    []
  );

  const utils = {
    get: useCallback((key: keyof T) => mapRef.current[key], []),
    ...stableActions,
  } as Actions<T>;

  return [{ ...mapRef.current }, utils];
};

export default useMap;
