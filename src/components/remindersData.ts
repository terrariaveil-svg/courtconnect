export type ReminderStatus = 'due' | 'scheduled';

export type Reminder = {
  id: number;
  order: number; // 1 = soonest
  title: string;
  text: string;
  day: string;
  time: string;
  withName: string;
  role: string;
  status: ReminderStatus;
  tip?: string;
};

export const INITIAL_REMINDERS: Reminder[] = [
  {
    id: 1,
    order: 1,
    title: 'Gym Floor reminder',
    text: 'Arrive 15 minutes early for your 9:30 AM session with Jamie K. at Downtown Club.',
    day: 'Today',
    time: '9:30–10:30 AM',
    withName: 'Jamie K.',
    role: 'Trainer',
    status: 'due',
    tip: 'For today’s Gym Floor session, arrive by 9:15 AM. Your session with Jamie K. starts at 9:30 AM.',
  },
  {
    id: 2,
    order: 2,
    title: 'Tennis Court 02 reminder',
    text: 'Bring your racket and water bottle for your 6:00 PM session with Alex M. at Downtown Club.',
    day: 'Tomorrow',
    time: '6:00–7:00 PM',
    withName: 'Alex M.',
    role: 'Partner',
    status: 'scheduled',
  },
  {
    id: 3,
    order: 3,
    title: 'Badminton Court 01 reminder',
    text: 'Bring your racket and indoor shoes for your 10:00 AM session at Downtown Club.',
    day: 'In 2 days',
    time: '10:00–11:00 AM',
    withName: 'Solo session',
    role: 'Open practice',
    status: 'scheduled',
  },
  {
    id: 4,
    order: 4,
    title: 'Studio 01 reminder',
    text: 'Bring a mat and water bottle for your 5:00 PM mobility session with Taylor R. at Downtown Club.',
    day: 'In 3 days',
    time: '5:00–6:00 PM',
    withName: 'Taylor R.',
    role: 'Instructor',
    status: 'scheduled',
  },
  {
    id: 5,
    order: 5,
    title: 'Gym Floor reminder',
    text: 'Arrive 15 minutes early for your 8:00 AM session with Jamie K. at Downtown Club.',
    day: 'In 5 days',
    time: '8:00–9:00 AM',
    withName: 'Jamie K.',
    role: 'Trainer',
    status: 'scheduled',
  },
];