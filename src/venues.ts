import fitnessImg from '../assets/fitness-center.jpeg';

// Optional photo from Figma: save it as src/assets/rally-badminton.png
// (.jpg / .jpeg / .webp also work). If the file isn't there, a stock photo is used.
const rallyPhotos = import.meta.glob('../assets/rally-badminton.*', {
  eager: true,
  import: 'default',
}) as Record<string, string>;

const rallyPhoto = Object.values(rallyPhotos)[0];

export type VenueKind = 'court' | 'gym';

export type Venue = {
  id: number;
  kind: VenueKind;
  name: string;
  sport: string;
  location: string;
  price: number;
  image: string;
  rating: number;
  reviews: number;
  courts: number;
  indoor: boolean;
  about: string;
  tags: string[];
};

export const COURTS: Venue[] = [
  {
    id: 1,
    kind: 'court',
    name: 'Champions Basketball Court',
    sport: 'Basketball',
    location: 'Kidapawan City, North Cotabato',
    price: 500,
    image:
      'https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&w=1400&q=80',
    rating: 4.9,
    reviews: 212,
    courts: 2,
    indoor: true,
    about:
      'Champions Basketball Court offers a premium indoor basketball experience for players of all levels. Our well-maintained hardwood courts, clean facilities, and friendly environment make it the perfect place to play, train, and enjoy the sport.',
    tags: ['Basketball', 'Indoor', 'For All Skill Levels', 'Friendly Community'],
  },
  {
    id: 2,
    kind: 'court',
    name: 'Elite Volleyball Arena',
    sport: 'Volleyball',
    location: 'Kidapawan City, North Cotabato',
    price: 400,
    image:
      'https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?auto=format&fit=crop&w=1400&q=80',
    rating: 4.7,
    reviews: 98,
    courts: 2,
    indoor: true,
    about:
      'Elite Volleyball Arena is a spacious indoor arena made for team practice and friendly matches. Enjoy a smooth court surface, quality nets, and a welcoming crowd of regular players.',
    tags: ['Volleyball', 'Indoor', 'Team Friendly', 'Friendly Community'],
  },
  {
    id: 3,
    kind: 'court',
    name: 'Rally Badminton Club',
    sport: 'Badminton',
    location: 'Kidapawan City, North Cotabato',
    price: 250,
    image:
      rallyPhoto ??
      'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?auto=format&fit=crop&w=1400&q=80',
    rating: 4.8,
    reviews: 124,
    courts: 2,
    indoor: true,
    about:
      'Rally Badminton Club offers a premium indoor badminton experience for players of all levels. Our well-maintained courts, clean facilities, and friendly environment make it the perfect place to play, train, and enjoy the sport.',
    tags: ['Badminton', 'Indoor', 'For All Skill Levels', 'Friendly Community'],
  },
  {
    id: 4,
    kind: 'court',
    name: 'Community Sports Complex',
    sport: 'Multi-sport',
    location: 'Kidapawan City, North Cotabato',
    price: 600,
    image:
      'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=1400&q=80',
    rating: 4.6,
    reviews: 87,
    courts: 3,
    indoor: false,
    about:
      'Community Sports Complex is a versatile sports space for your next activity, with room for football, running and group games. Open-air fields and courts keep it fresh and fun.',
    tags: ['Multi-sport', 'Outdoor', 'Groups Welcome', 'Friendly Community'],
  },
];

export const GYMS: Venue[] = [
  {
    id: 5,
    kind: 'gym',
    name: 'Downtown Gym Floor',
    sport: 'Gym floor',
    location: 'Downtown Club, Kidapawan City',
    price: 150,
    image: fitnessImg,
    rating: 4.8,
    reviews: 156,
    courts: 1,
    indoor: true,
    about:
      'Downtown Gym Floor offers a premium gym experience for members of all levels. Our well-maintained equipment, clean facilities, and friendly environment make it the perfect place to train, build strength, and stay active.',
    tags: ['Gym floor', 'Indoor', 'All Fitness Levels', 'Friendly Community'],
  },
  {
    id: 6,
    kind: 'gym',
    name: 'Strength & Cardio Zone',
    sport: 'Gym floor',
    location: 'Kidapawan City, North Cotabato',
    price: 200,
    image: fitnessImg,
    rating: 4.7,
    reviews: 73,
    courts: 1,
    indoor: true,
    about:
      'Strength & Cardio Zone has treadmills, bikes and racks for a full workout session. Train on your own or bring a friend and keep each other going.',
    tags: ['Gym floor', 'Indoor', 'Cardio & Strength', 'Friendly Community'],
  },
];

export const ALL_VENUES: Venue[] = [...COURTS, ...GYMS];

export const venueMatches = (v: Venue, query: string): boolean =>
  `${v.name} ${v.sport} ${v.location} ${v.kind === 'gym' ? 'gym fitness' : 'court'}`
    .toLowerCase()
    .includes(query.trim().toLowerCase());

export const courtLabelFor = (v: Venue, hour: number): string =>
  v.kind === 'gym' ? 'Gym floor' : `Court ${String((hour % v.courts) + 1).padStart(2, '0')}`;

// The hourly slots shown on the venue page
export const SLOT_HOURS = [8, 9, 10, 11, 13, 14, 15, 16, 17, 18, 19, 20];

// A repeatable "someone else already booked this" pattern, so every date
// looks different but the same date always looks the same.
export function takenByOthers(venueId: number, date: string, hour: number): boolean {
  let h = venueId * 31 + hour * 17;
  for (const ch of date) {
    h = (h * 33 + ch.charCodeAt(0)) % 9973;
  }
  return h % 5 === 0;
}