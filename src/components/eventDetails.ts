import type { EventCategory } from './eventsList';

export type EventExtras = {
  schedule: { time: string; label: string }[];
  bring: string[];
};

const EXTRAS: Record<EventCategory, EventExtras> = {
  Badminton: {
    schedule: [
      { time: 'Arrive', label: 'Check-in opens 15 minutes early' },
      { time: 'Warm-up', label: 'Light drills and court assignments' },
      { time: 'Play', label: 'Matches with court rotations' },
      { time: 'Wrap-up', label: 'Final games and thank-yous' },
    ],
    bring: ['Badminton racket', 'Indoor court shoes', 'Water bottle', 'Towel'],
  },
  Basketball: {
    schedule: [
      { time: 'Arrive', label: 'Check-in and team placement' },
      { time: 'Warm-up', label: 'Shootaround and quick briefing' },
      { time: 'Play', label: 'Games, winners stay on' },
      { time: 'Wrap-up', label: 'Final game and group photo' },
    ],
    bring: ['Basketball shoes', 'Water bottle', 'Towel', 'Valid ID'],
  },
  Fitness: {
    schedule: [
      { time: 'Arrive', label: 'Check-in and bib pick-up' },
      { time: 'Warm-up', label: 'Stretching led by our host' },
      { time: 'Go', label: 'The main activity begins' },
      { time: 'Cool-down', label: 'Stretch, snacks and finisher photos' },
    ],
    bring: ['Running shoes', 'Water bottle', 'Sunscreen', 'Light towel'],
  },
  Tournament: {
    schedule: [
      { time: 'Arrive', label: 'Team check-in and briefing' },
      { time: 'Round 1', label: 'Group stage games' },
      { time: 'Finals', label: 'Semi-finals and championship' },
      { time: 'Awards', label: 'Trophies and prizes' },
    ],
    bring: ['Team jersey', 'Sports shoes', 'Water bottle', 'Valid ID'],
  },
};

export const extrasFor = (category: EventCategory): EventExtras => EXTRAS[category];