import axios from 'axios';
import { Incident, Resource, Shelter, User, VolunteerNearby, Task, Alert } from '../types';

export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api/v1';
export const SERVER_URL = API_URL.replace('/api/v1', '');

export const api = axios.create({
  baseURL: API_URL,
});

// Attach JWT token from localStorage to all requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('disaster_auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// API Functions

export const authApi = {
  login: async (email: string, password: string): Promise<{ user: User; token: string }> => {
    const res = await api.post('/auth/login', { email, password });
    return res.data.data;
  },
  getMe: async (): Promise<User> => {
    const res = await api.get('/auth/me');
    return res.data.data.user;
  },
};

export const incidentApi = {
  getAll: async (params?: { status?: string; severity?: string }): Promise<Incident[]> => {
    const res = await api.get('/incidents', { params });
    return res.data.data.incidents;
  },
  getById: async (id: string): Promise<Incident> => {
    const res = await api.get(`/incidents/${id}`);
    return res.data.data.incident;
  },
  update: async (id: string, data: Partial<Incident>): Promise<Incident> => {
    const res = await api.patch(`/incidents/${id}`, data);
    return res.data.data.incident;
  },
  getNearbyVolunteers: async (id: string): Promise<{ volunteers: VolunteerNearby[]; total: number }> => {
    const res = await api.get(`/incidents/${id}/nearby-volunteers`);
    return res.data.data;
  },
  assignVolunteer: async (incidentId: string, volunteerId: string): Promise<{ task: Task }> => {
    const res = await api.post(`/incidents/${incidentId}/assign`, { volunteerId });
    return res.data.data;
  },
};

export const resourceApi = {
  getAll: async (): Promise<Resource[]> => {
    const res = await api.get('/resources');
    return res.data.data.resources;
  },
  create: async (data: Omit<Resource, 'id' | 'createdAt' | 'updatedAt'>): Promise<Resource> => {
    const res = await api.post('/resources', data);
    return res.data.data.resource;
  },
  update: async (id: string, data: Partial<Resource>): Promise<Resource> => {
    const res = await api.patch(`/resources/${id}`, data);
    return res.data.data.resource;
  },
  delete: async (id: string): Promise<void> => {
    await api.delete(`/resources/${id}`);
  },
};

export const shelterApi = {
  getAll: async (): Promise<Shelter[]> => {
    const res = await api.get('/shelters');
    return res.data.data.shelters;
  },
  create: async (data: Omit<Shelter, 'id' | 'createdAt' | 'updatedAt'>): Promise<Shelter> => {
    const res = await api.post('/shelters', data);
    return res.data.data.shelter;
  },
  update: async (id: string, data: Partial<Shelter>): Promise<Shelter> => {
    const res = await api.patch(`/shelters/${id}`, data);
    return res.data.data.shelter;
  },
  delete: async (id: string): Promise<void> => {
    await api.delete(`/shelters/${id}`);
  },
};

export const alertApi = {
  getAll: async (params?: { channel?: string; severity?: string }): Promise<Alert[]> => {
    const res = await api.get('/alerts', { params });
    return res.data.data.alerts;
  },
  send: async (data: { message: string; region?: string; severity?: string }): Promise<any> => {
    const res = await api.post('/alerts/send', data);
    return res.data.data;
  },
};

