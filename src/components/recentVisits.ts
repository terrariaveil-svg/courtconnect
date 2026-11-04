import type { Facility } from './AvailableSpaces';

export type VisitSource = Facility;

export type Visit = {
  id: number;
  name: string;
  type: string;
  image: string;
  visitedAt: string;
};

const STORAGE_KEY = 'courtconnect.recentVisits';
const MAX_VISITS = 10;

export function loadVisits(userKey: string): Visit[] {
  try {
    const saved = localStorage.getItem(`${STORAGE_KEY}.${userKey}`);
    if (!saved) return [];

    const parsed: unknown = JSON.parse(saved);
    return Array.isArray(parsed) ? (parsed as Visit[]) : [];
  } catch {
    return [];
  }
}

export function saveVisits(userKey: string, visits: Visit[]): void {
  try {
    localStorage.setItem(`${STORAGE_KEY}.${userKey}`, JSON.stringify(visits));
  } catch (error) {
    console.error('Unable to save recent visits.', error);
  }
}

export function addVisit(
  visits: Visit[],
  source: VisitSource,
  when: Date = new Date(),
): Visit[] {
  const visit: Visit = {
    id: source.id,
    name: source.name,
    type: source.type,
    image: source.image,
    visitedAt: when.toISOString(),
  };

  return [
    visit,
    ...visits.filter((item) => item.id !== visit.id),
  ].slice(0, MAX_VISITS);
}

export function fmtVisitDate(value: string | Date): string {
  const date = value instanceof Date ? value : new Date(value);

  if (Number.isNaN(date.getTime())) return 'Recently visited';

  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}