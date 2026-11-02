import { addDaysISO, todayISO } from './appUtils';

export type EventCategory = 'Badminton' | 'Basketball' | 'Fitness' | 'Tournament';

export type ClubEvent = {
  id: number;
  name: string;
  category: EventCategory;
  date: string; // ISO yyyy-mm-dd
  venue: string;
  city: string;
  price: number;
  spotsLeft: number;
  description: string;
  registered: boolean;
};

export const CATEGORIES: { id: EventCategory; label: string; emoji: string }[] = [
  { id: 'Badminton', label: 'Badminton', emoji: '🏸' },
  { id: 'Basketball', label: 'Basketball', emoji: '🏀' },
  { id: 'Fitness', label: 'Running & Fitness', emoji: '🏃' },
  { id: 'Tournament', label: 'Tournaments', emoji: '🏆' },
];

export const emojiFor = (c: EventCategory): string =>
  CATEGORIES.find((x) => x.id === c)?.emoji ?? '🏅';

export const eventMatches = (e: ClubEvent, query: string): boolean =>
  `${e.name} ${e.category} ${e.venue} ${e.city}`.toLowerCase().includes(query.trim().toLowerCase());

export function seedEvents(): ClubEvent[] {
  const t = todayISO();
  const city = 'Kidapawan City';
  const make = (
    id: number,
    name: string,
    category: EventCategory,
    days: number,
    venue: string,
    price: number,
    spotsLeft: number,
    description: string,
  ): ClubEvent => ({
    id,
    name,
    category,
    date: addDaysISO(t, days),
    venue,
    city,
    price,
    spotsLeft,
    description,
    registered: false,
  });

  return [
    make(1, 'City Badminton Open', 'Badminton', 2, 'Rally Badminton Club', 150, 24,
      'Singles and doubles brackets for every level. Bring your racket and a water bottle.'),
    make(2, '3×3 Weekend Showdown', 'Basketball', 3, "People's Gym", 200, 12,
      'Fast 3-on-3 games with a winner-stays format. Teams of three, subs welcome.'),
    make(3, 'Community Fun Run 5K', 'Fitness', 7, 'City Oval', 100, 68,
      'A relaxed 5K for walkers, joggers and runners. Free water stations along the route.'),
    make(4, 'Junior Badminton Clinic', 'Badminton', 5, 'Rally Badminton Club', 200, 14,
      'A coach-led clinic for beginners aged 10 to 16. Footwork, grips and match play.'),
    make(5, 'Doubles Night', 'Badminton', 9, 'Rally Badminton Club', 120, 16,
      'Come solo or with a partner. Pairings are shuffled every round.'),
    make(6, 'Hoops Open Run', 'Basketball', 10, 'Champions Basketball Court', 80, 20,
      'Pick-up games all evening. Show up, get picked, and play.'),
    make(7, 'Sunrise Yoga & Stretch', 'Fitness', 12, 'Downtown Club', 0, 30,
      'Start the day with a gentle, free yoga and stretching session.'),
    make(8, 'Late Night Hoops League', 'Basketball', 14, 'Champions Basketball Court', 150, 18,
      'A four-week league with a final on week five. Register your team early.'),
    make(9, 'Kidapawan Cup', 'Tournament', 15, 'Community Sports Complex', 300, 8,
      'Multi-sport weekend tournament with trophies and prizes for every division.'),
    make(10, 'Inter-Barangay Volleyball League', 'Tournament', 21, 'Elite Volleyball Arena', 250, 10,
      'Barangay teams compete for the league title. Six players per team.'),
  ];
}