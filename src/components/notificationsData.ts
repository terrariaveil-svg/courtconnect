import { addDaysISO, todayISO } from './eventsList';

export type IconKind = 'bell' | 'calendar' | 'people';
export type NoticeType = 'Confirmation' | 'Check-in' | 'Partner update';

export type Notice = {
  id: number;
  order: number; // 1 = newest
  date: string;
  icon: IconKind;
  title: string;
  text: string;
  day: string;
  time: string;
  type: NoticeType;
  unread: boolean;
};

const today = todayISO();

export const INITIAL_NOTICES: Notice[] = [
  {
    id: 1,
    order: 1,
    date: addDaysISO(today, 1),
    icon: 'bell',
    title: 'Tennis Court 02 confirmed',
    text: 'Your 6:00 PM booking at Downtown Club is confirmed and ready for check-in.',
    day: 'Tomorrow',
    time: '6:00–7:00 PM',
    type: 'Confirmation',
    unread: true,
  },
  {
    id: 2,
    order: 2,
    date: today,
    icon: 'calendar',
    title: 'Reminder: Gym Floor check-in',
    text: 'Arrive 15 minutes early for your 9:30 AM session with Jamie K. at Downtown Club.',
    day: 'Today',
    time: '9:30–10:30 AM',
    type: 'Check-in',
    unread: true,
  },
  {
    id: 3,
    order: 3,
    date: addDaysISO(today, 1),
    icon: 'people',
    title: 'Partner update: Tennis Court 02',
    text: 'Alex M. has confirmed for your 6:00 PM session at Downtown Club.',
    day: 'Tomorrow',
    time: '6:00–7:00 PM',
    type: 'Partner update',
    unread: true,
  },
  {
    id: 4,
    order: 4,
    date: addDaysISO(today, 2),
    icon: 'bell',
    title: 'Badminton Court 01 confirmed',
    text: 'Your 10:00 AM booking at Downtown Club is confirmed. Your court is reserved.',
    day: 'In 2 days',
    time: '10:00–11:00 AM',
    type: 'Confirmation',
    unread: false,
  },
  {
    id: 5,
    order: 5,
    date: addDaysISO(today, 3),
    icon: 'calendar',
    title: 'Studio 01 confirmed',
    text: 'Your 5:00 PM mobility session at Downtown Club is confirmed with Taylor R.',
    day: 'In 3 days',
    time: '5:00–6:00 PM',
    type: 'Confirmation',
    unread: false,
  },
  {
    id: 6,
    order: 6,
    date: addDaysISO(today, 5),
    icon: 'bell',
    title: 'Gym Floor confirmed',
    text: 'Your next 8:00 AM session with Jamie K. at Downtown Club is confirmed.',
    day: 'In 5 days',
    time: '8:00–9:00 AM',
    type: 'Confirmation',
    unread: false,
  },
];