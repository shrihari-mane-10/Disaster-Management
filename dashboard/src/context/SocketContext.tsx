import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { SERVER_URL } from '../lib/api';
import { useAuth } from './AuthContext';
import { Incident } from '../types';

export interface LiveVolunteerLocation {
  userId: string;
  name: string;
  role: string;
  lat: number;
  lng: number;
  lastSeenAt: string;
}

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  liveVolunteers: LiveVolunteerLocation[];
  latestSosAlert: Incident | null;
  clearLatestSosAlert: () => void;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { token, isAuthenticated } = useAuth();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [liveVolunteersMap, setLiveVolunteersMap] = useState<Map<string, LiveVolunteerLocation>>(new Map());
  const [latestSosAlert, setLatestSosAlert] = useState<Incident | null>(null);

  useEffect(() => {
    if (!isAuthenticated || !token) {
      if (socket) {
        socket.disconnect();
        setSocket(null);
        setIsConnected(false);
      }
      return;
    }

    const liveUrl = `${SERVER_URL}/live`;
    console.log(`🔌 [Dashboard Socket] Connecting to ${liveUrl}...`);

    const newSocket = io(liveUrl, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 2000,
    });

    newSocket.on('connect', () => {
      console.log(`✅ [Dashboard Socket] Connected! Socket ID: ${newSocket.id}`);
      setIsConnected(true);
    });

    newSocket.on('disconnect', () => {
      console.log(`🛑 [Dashboard Socket] Disconnected`);
      setIsConnected(false);
    });

    // 1. Initial snapshot of active volunteers from server
    newSocket.on('volunteers:snapshot', (snapshot: LiveVolunteerLocation[]) => {
      const map = new Map<string, LiveVolunteerLocation>();
      snapshot.forEach((v) => map.set(v.userId, v));
      setLiveVolunteersMap(map);
    });

    // 2. Real-time volunteer location ping
    newSocket.on('location:update', (data: LiveVolunteerLocation) => {
      if (data.role === 'volunteer') {
        setLiveVolunteersMap((prev) => {
          const next = new Map(prev);
          next.set(data.userId, data);
          return next;
        });
      }
    });

    // 3. New Incident Reported (especially SOS)
    newSocket.on('incident:new', (incident: Incident) => {
      console.log('🚨 [Dashboard Socket] Real-time incident received:', incident);
      if (incident.severity === 'critical' || incident.type.toLowerCase().includes('sos')) {
        setLatestSosAlert(incident);
      }
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [isAuthenticated, token]);

  const clearLatestSosAlert = () => setLatestSosAlert(null);

  const liveVolunteers = Array.from(liveVolunteersMap.values());

  return (
    <SocketContext.Provider
      value={{
        socket,
        isConnected,
        liveVolunteers,
        latestSosAlert,
        clearLatestSosAlert,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};
