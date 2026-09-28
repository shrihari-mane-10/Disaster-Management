export type RoleType = 'citizen' | 'volunteer' | 'authority' | 'admin';
export type SeverityType = 'low' | 'medium' | 'high' | 'critical';
export type IncidentStatusType = 'pending' | 'assigned' | 'in_progress' | 'resolved' | 'rejected';
export type TaskStatusType = 'assigned' | 'enroute' | 'reached' | 'resolved';
export type AlertChannelType = 'inapp' | 'socket' | 'sms_mock';

export const Role = {
  citizen: 'citizen' as const,
  volunteer: 'volunteer' as const,
  authority: 'authority' as const,
  admin: 'admin' as const,
};

export const Severity = {
  low: 'low' as const,
  medium: 'medium' as const,
  high: 'high' as const,
  critical: 'critical' as const,
};

export const IncidentStatus = {
  pending: 'pending' as const,
  assigned: 'assigned' as const,
  in_progress: 'in_progress' as const,
  resolved: 'resolved' as const,
  rejected: 'rejected' as const,
};

export const TaskStatus = {
  assigned: 'assigned' as const,
  enroute: 'enroute' as const,
  reached: 'reached' as const,
  resolved: 'resolved' as const,
};

export const AlertChannel = {
  inapp: 'inapp' as const,
  socket: 'socket' as const,
  sms_mock: 'sms_mock' as const,
};

export type Role = typeof Role[keyof typeof Role];
export type Severity = typeof Severity[keyof typeof Severity];
export type IncidentStatus = typeof IncidentStatus[keyof typeof IncidentStatus];
export type TaskStatus = typeof TaskStatus[keyof typeof TaskStatus];
export type AlertChannel = typeof AlertChannel[keyof typeof AlertChannel];
