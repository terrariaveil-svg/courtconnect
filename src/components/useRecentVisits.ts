import { useCallback, useState } from 'react';
import { addVisit, loadVisits, saveVisits } from './recentVisits';
import type { Visit, VisitSource } from './recentVisits';

export function useRecentVisits(userKey: string) {
  const [visits, setVisits] = useState<Visit[]>(() => loadVisits(userKey));
  const [loadedFor, setLoadedFor] = useState(userKey);

  if (loadedFor !== userKey) {
    setLoadedFor(userKey);
    setVisits(loadVisits(userKey));
  }

  const record = useCallback(
    (source: VisitSource, when: Date = new Date()) => {
      setVisits((prev) => {
        const next = addVisit(prev, source, when);
        saveVisits(userKey, next);
        return next;
      });
    },
    [userKey],
  );

  const clear = useCallback(() => {
    setVisits([]);
    saveVisits(userKey, []);
  }, [userKey]);

  const replace = useCallback((forUserKey: string, next: Visit[]) => {
    setLoadedFor(forUserKey);
    setVisits(next);
    saveVisits(forUserKey, next);
  }, []);

  return { visits, record, clear, replace };
}