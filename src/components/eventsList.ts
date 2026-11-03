export type EventCategory = 'Badminton' | 'Basketball' | 'Fitness' | 'Tournament';

export type ClubEvent = {
  id: number;
  name: string;
  category: EventCategory;
  date: string; // ISO yyyy-mm-dd
  time: string;
  venue: string;
  city: string;
  price: number;
  capacity: number;
  spotsLeft: number;
  organizer: string;
  description: string;
  image: string;
};

// What the "Create Event" form sends back
export type NewEvent = {
  name: string;
  category: EventCategory;
  date: string;
  time: string;
  venue: string;
  price: number;
  spots: number;
};

export const CATEGORIES: { id: EventCategory; label: string; emoji: string }[] = [
  { id: 'Badminton', label: 'Badminton', emoji: '🏸' },
  { id: 'Basketball', label: 'Basketball', emoji: '🏀' },
  { id: 'Fitness', label: 'Running & Fitness', emoji: '🏃' },
  { id: 'Tournament', label: 'Tournaments', emoji: '🏆' },
];

export const emojiFor = (c: EventCategory): string =>
  CATEGORIES.find((x) => x.id === c)?.emoji ?? '🏅';

export const labelFor = (c: EventCategory): string =>
  CATEGORIES.find((x) => x.id === c)?.label ?? c;

const IMAGES: Record<EventCategory, string> = {
  Badminton:
    'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?auto=format&fit=crop&w=1400&q=80',
  Basketball:
    'https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&w=1400&q=80',
  Fitness:
    'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=1400&q=80',
  Tournament:
    'https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?auto=format&fit=crop&w=1400&q=80',
};

/* ---------- Dates ---------- */
const pad2 = (n: number): string => String(n).padStart(2, '0');

export const toISO = (d: Date): string =>
  `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;

export const fromISO = (iso: string): Date => {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d);
};

export const todayISO = (): string => toISO(new Date());

export const addDaysISO = (iso: string, days: number): string => {
  const d = fromISO(iso);
  d.setDate(d.getDate() + days);
  return toISO(d);
};

// "Saturday, October 31, 2026"
export const fmtFull = (iso: string): string =>
  fromISO(iso).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

// "Nov 4, 2026"
export const fmtShort = (iso: string): string =>
  fromISO(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

// "Today", "Tomorrow", "In 3 days", or a short date
export function relDay(iso: string): string {
  const diff = Math.round((fromISO(iso).getTime() - fromISO(todayISO()).getTime()) / 86400000);
  if (diff === 0) return 'Today';
  if (diff === 1) return 'Tomorrow';
  if (diff > 1 && diff < 7) return `In ${diff} days`;
  return fmtShort(iso);
}

/* ---------- Events ---------- */
export function makeEvent(id: number, data: NewEvent): ClubEvent {
  return {
    id,
    name: data.name,
    category: data.category,
    date: data.date,
    time: data.time,
    venue: data.venue,
    city: 'Kidapawan City',
    price: data.price,
    capacity: data.spots,
    spotsLeft: data.spots,
    organizer: 'You',
    description: `${data.name} is open to everyone. Register to save your spot.`,
    image: IMAGES[data.category],
  };
}

// The starting events. Dates are counted from today, so they are always upcoming.
export function seedEvents(): ClubEvent[] {
  const t = todayISO();
  const city = 'Kidapawan City';

  const make = (
    id: number,
    name: string,
    category: EventCategory,
    days: number,
    time: string,
    venue: string,
    price: number,
    capacity: number,
    spotsLeft: number,
    organizer: string,
    description: string,
  ): ClubEvent => ({
    id,
    name,
    category,
    date: addDaysISO(t, days),
    time,
    venue,
    city,
    price,
    capacity,
    spotsLeft,
    organizer,
    description,
    image: IMAGES[category],
  });

  return [
    make(1, 'City Badminton Open', 'Badminton', 2, '6:00 PM – 9:00 PM', 'Rally Badminton Club', 150, 40, 24,
      'Rally Badminton Club',
      'Singles and doubles brackets for every level. Courts rotate often, so you always get a game. Shuttlecocks are included. Bring your own racket.'),
    make(2, '3×3 Weekend Showdown', 'Basketball', 3, '2:00 PM – 6:00 PM', "People's Gym", 200, 36, 12,
      "People's Gym Hoops",
      'Fast 3-on-3 games with a winner-stays format. Teams of three, subs welcome. Sign up solo and we will place you on a team.'),
    make(3, 'Community Fun Run 5K', 'Fitness', 7, '6:00 AM – 9:00 AM', 'City Oval', 100, 150, 68,
      'Kidapawan Runners Club',
      'A relaxed 5K for walkers, joggers and runners. Water stations along the route and a finisher medal for everyone.'),
    make(4, 'Junior Badminton Clinic', 'Badminton', 5, '3:00 PM – 5:00 PM', 'Rally Badminton Club', 200, 20, 14,
      'Rally Badminton Club',
      'A coach-led clinic for beginners aged 10 to 16. Footwork, grips and simple match play in a friendly setting.'),
    make(5, 'Doubles Night', 'Badminton', 9, '7:00 PM – 10:00 PM', 'Rally Badminton Club', 120, 24, 16,
      'Rally Badminton Club',
      'Come solo or with a partner. Pairings are shuffled every round so you meet new players.'),
    make(6, 'Hoops Open Run', 'Basketball', 10, '6:00 PM – 9:00 PM', 'Champions Basketball Court', 80, 30, 20,
      'Champions Basketball Court',
      'Pick-up games all evening. Show up, get picked, and play. All levels are welcome.'),
    make(7, 'Sunrise Yoga & Stretch', 'Fitness', 12, '6:00 AM – 7:30 AM', 'Downtown Club', 0, 40, 30,
      'Downtown Club',
      'Start the day with a gentle, free yoga and stretching session. Mats are available to borrow.'),
    make(8, 'Late Night Hoops League', 'Basketball', 14, '8:00 PM – 11:00 PM', 'Champions Basketball Court', 150, 32, 18,
      'Champions Basketball Court',
      'A four-week league with a final on week five. Register early to be placed on a team.'),
    make(9, 'Kidapawan Cup', 'Tournament', 15, '8:00 AM – 6:00 PM', 'Community Sports Complex', 300, 64, 8,
      'CourtConnect Events Team',
      'A multi-sport weekend tournament with trophies and prizes for every division.'),
    make(10, 'Inter-Barangay Volleyball League', 'Tournament', 21, '9:00 AM – 5:00 PM', 'Elite Volleyball Arena', 250, 60, 10,
      'CourtConnect Events Team',
      'Barangay teams compete for the league title. Six players per team.'),
  ];
}