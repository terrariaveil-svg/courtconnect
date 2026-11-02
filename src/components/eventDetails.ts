export type EventInfo = {
  time: string;
  location: string;
  organizer: string;
  capacity: number;
  spotsLeft: number;
  about: string;
  schedule: { time: string; label: string }[];
  bring: string[];
};

const DEFAULT_INFO: EventInfo = {
  time: '9:00 AM – 12:00 PM',
  location: 'CourtConnect Sports Complex, Kidapawan City',
  organizer: 'CourtConnect Events Team',
  capacity: 40,
  spotsLeft: 20,
  about: 'Join other players for a fun, friendly day of sports. Everyone is welcome, whatever your level.',
  schedule: [
    { time: '8:30 AM', label: 'Check-in opens' },
    { time: '9:00 AM', label: 'Warm-up' },
    { time: '9:30 AM', label: 'Games begin' },
    { time: '12:00 PM', label: 'Wrap-up and awards' },
  ],
  bring: ['Water bottle', 'Towel', 'Sports shoes', 'Valid ID'],
};

export const EVENT_INFO: Record<number, EventInfo> = {
  1: {
    time: '8:00 AM – 5:00 PM',
    location: 'CourtConnect Sports Complex, Kidapawan City',
    organizer: 'Kidapawan Basketball League',
    capacity: 80,
    spotsLeft: 32,
    about:
      'The Community Basketball Tournament brings teams from around the city together for a full day of games. Teams are grouped by level, so every match is a fair fight. Register as a player and we will place you on a team if you do not have one yet.',
    schedule: [
      { time: '8:00 AM', label: 'Team check-in and briefing' },
      { time: '9:00 AM', label: 'Group stage games' },
      { time: '1:00 PM', label: 'Lunch break' },
      { time: '2:00 PM', label: 'Semi-finals' },
      { time: '4:00 PM', label: 'Championship game and awards' },
    ],
    bring: ['Team jersey', 'Basketball shoes', 'Water bottle', 'Valid ID'],
  },
  2: {
    time: '3:00 PM – 6:00 PM',
    location: 'CourtConnect Sports Complex, Kidapawan City',
    organizer: 'CourtConnect Events Team',
    capacity: 40,
    spotsLeft: 14,
    about:
      'A free, relaxed volleyball afternoon. Teams are mixed on the spot so you can meet new people and play a few quick matches. Nets and balls are provided.',
    schedule: [
      { time: '2:30 PM', label: 'Sign-in and team mixing' },
      { time: '3:00 PM', label: 'Round-robin matches' },
      { time: '5:00 PM', label: 'Friendly final' },
      { time: '5:45 PM', label: 'Group photo' },
    ],
    bring: ['Knee pads (optional)', 'Water bottle', 'Sunscreen', 'Towel'],
  },
  3: {
    time: '6:00 PM – 9:00 PM',
    location: 'CourtConnect Sports Complex, Kidapawan City',
    organizer: 'Rally Badminton Club',
    capacity: 24,
    spotsLeft: 9,
    about:
      'Open play for badminton lovers. Courts rotate every 20 minutes, so you will always get a game. Shuttlecocks are included. Bring your own racket.',
    schedule: [
      { time: '5:45 PM', label: 'Check-in' },
      { time: '6:00 PM', label: 'Open play, round 1' },
      { time: '7:15 PM', label: 'Open play, round 2' },
      { time: '8:30 PM', label: 'Mini doubles challenge' },
    ],
    bring: ['Badminton racket', 'Indoor court shoes', 'Water bottle', 'Towel'],
  },
};

export const infoFor = (id: number): EventInfo => EVENT_INFO[id] ?? DEFAULT_INFO;