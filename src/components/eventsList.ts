import type { SportEvent } from './Events';

export const EVENTS: SportEvent[] = [
  {
    id: 1,
    name: "Community Basketball Tournament",
    category: "Basketball",
    date: "November 15, 2026",
    price: 100,
    image: "https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: 2,
    name: "Volleyball Friendly Match",
    category: "Volleyball",
    date: "November 21, 2026",
    price: 0,
    image: "https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: 3,
    name: "Badminton Open Play",
    category: "Badminton",
    date: "November 28, 2026",
    price: 50,
    image: "https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?auto=format&fit=crop&w=900&q=80",
  },
];