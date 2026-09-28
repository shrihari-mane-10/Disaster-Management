export type Role = 'citizen' | 'volunteer' | 'authority' | 'admin';
export type Severity = 'low' | 'medium' | 'high' | 'critical';
export type IncidentStatus = 'pending' | 'assigned' | 'in_progress' | 'resolved' | 'rejected';
export type TaskStatus = 'assigned' | 'enroute' | 'reached' | 'resolved';

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  role: Role;
  lat?: number | null;
  lng?: number | null;
  available?: boolean;
  lastSeenAt?: string | null;
  createdAt?: string;
}

export interface Media {
  id: string;
  incidentId: string;
  path: string;
  createdAt: string;
}

export interface Incident {
  id: string;
  reporterId?: string | null;
  reporter?: {
    id: string;
    name: string;
    phone?: string | null;
    email: string;
  } | null;
  type: string;
  description: string;
  severity: Severity;
  status: IncidentStatus;
  lat: number;
  lng: number;
  verified: boolean;
  media?: Media[];
  tasks?: Task[];
  createdAt: string;
  updatedAt: string;
}

export interface Task {
  id: string;
  incidentId: string;
  volunteerId: string;
  status: TaskStatus;
  assignedAt: string;
  resolvedAt?: string | null;
  volunteer?: {
    id: string;
    name: string;
    phone?: string | null;
  };
}

export interface VolunteerNearby extends User {
  distanceKm: number;
}

export interface Resource {
  id: string;
  type: string;
  quantity: number;
  lat?: number | null;
  lng?: number | null;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface Shelter {
  id: string;
  name: string;
  lat: number;
  lng: number;
  capacity: number;
  occupancy: number;
  createdAt: string;
  updatedAt: string;
}

export type AlertChannel = 'inapp' | 'socket' | 'sms_mock';

export interface Alert {
  id: string;
  message: string;
  region?: string | null;
  severity: Severity;
  channel: AlertChannel;
  createdBy?: string | null;
  creator?: {
    id: string;
    name: string;
    email: string;
    role: Role;
  } | null;
  createdAt: string;
}

