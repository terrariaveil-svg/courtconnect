import type { Facility } from './AvailableSpaces';
import type { SpaceChoice } from './QuickBook';
import fitnessImg from '../assets/fitness-center.jpeg';

// Optional Rally Badminton photo
const rallyPhotos = import.meta.glob('../assets/rally-badminton.*', {
  eager: true,
  import: 'default',
}) as Record<string, string>;

const rallyPhoto = Object.values(rallyPhotos)[0];

// COURT FACILITIES
export const COURTS: Facility[] = [
  {
    id: 1,
    name: 'Champions Basketball Court',
    type: 'Basketball',
    location: 'Kidapawan City, North Cotabato',
    price: 500,
    image: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&w=900&q=80',
    description: 'An indoor court for friendly games and tournaments.',
  },
  {
    id: 2,
    name: 'Elite Volleyball Arena',
    type: 'Volleyball',
    location: 'Kidapawan City, North Cotabato',
    price: 400,
    image: 'https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?auto=format&fit=crop&w=900&q=80',
    description: 'A spacious court for team practice and matches.',
  },
  {
    id: 3,
    name: 'Rally Badminton Club',
    type: 'Badminton',
    location: 'Kidapawan City, North Cotabato',
    price: 250,
    image:
      rallyPhoto ??
      'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?auto=format&fit=crop&w=900&q=80',
    description: 'A court for casual rallies and competitive play.',
  },
  {
    id: 4,
    name: 'Community Sports Complex',
    type: 'Multi-sport',
    location: 'Kidapawan City, North Cotabato',
    price: 600,
    image: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=900&q=80',
    description: 'A versatile sports space for your next activity.',
  },
];

// GYM FACILITIES
export const GYMS: Facility[] = [
  {
    id: 5,
    name: 'Downtown Gym Floor',
    type: 'Gym floor',
    location: 'Downtown Club, Kidapawan City',
    price: 150,
    image: fitnessImg,
    description: 'Open floor with free weights, benches and cardio machines.',
  },
  {
    id: 6,
    name: 'Strength & Cardio Zone',
    type: 'Gym floor',
    location: 'Kidapawan City, North Cotabato',
    price: 200,
    image: fitnessImg,
    description: 'Treadmills, bikes and racks for a full workout session.',
  },
  {
    id: 7,
    name: 'Premium Fitness Center',
    type: 'Gym floor',
    location: 'Kidapawan City, North Cotabato',
    price: 250,
    image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=900&q=80',
    description: 'A modern fitness facility with equipment for strength training and workouts.',
  },
  {
    id: 8,
    name: 'Powerhouse Training Gym',
    type: 'Gym floor',
    location: 'Kidapawan City, North Cotabato',
    price: 300,
    image: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&w=900&q=80',
    description: 'A spacious training area equipped for full-body workouts and fitness sessions.',
  },
];

// RETURN FACILITIES BASED ON SELECTED CATEGORY
export const spacesFor = (choice: SpaceChoice): Facility[] => {
  return choice === 'gym' ? GYMS : COURTS;
};