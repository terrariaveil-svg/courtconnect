import type { Facility } from './AvailableSpaces';
import type { ApprovalStatus } from './approval';

export type CourtRequestStatus = Extract<
  ApprovalStatus,
  'Pending' | 'Confirmed' | 'Rejected'
>;

export type CourtRequest = Omit<Facility, 'id'> & {
  id: number;
  requesterId?: string;
  requesterName: string;
  requesterEmail: string;
  status: CourtRequestStatus;
};
