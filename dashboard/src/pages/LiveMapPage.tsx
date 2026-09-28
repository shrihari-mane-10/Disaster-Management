import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { incidentApi, SERVER_URL, shelterApi } from '../lib/api';
import { Incident, Shelter, Severity } from '../types';
import { StatusBadge } from '../components/StatusBadge';
import { AssignVolunteerModal } from '../components/AssignVolunteerModal';
import { useSocket } from '../context/SocketContext';
import {
  AlertCircle,
  RefreshCw,
  UserCheck,
  ShieldCheck,
  Home,
  Users,
  Filter,
  Radio,
  X,
} from 'lucide-react';

// Custom Leaflet Icons by Severity
const createPinIcon = (severity: Severity, isSos: boolean) => {
  let pinClass = 'pin-medium';
  let iconEmoji = '⚠️';

  if (isSos || severity === 'critical') {
    pinClass = 'pin-critical';
    iconEmoji = '🚨';
  } else if (severity === 'high') {
    pinClass = 'pin-high';
    iconEmoji = '🔥';
  } else if (severity === 'low') {
    pinClass = 'pin-low';
    iconEmoji = 'ℹ️';
  }

  return L.divIcon({
    className: `custom-pin ${pinClass}`,
    html: `<span>${iconEmoji}</span>`,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
    popupAnchor: [0, -14],
  });
};

const shelterPinIcon = L.divIcon({
  className: 'custom-pin bg-emerald-600',
  html: '<span>🏠</span>',
  iconSize: [26, 26],
  iconAnchor: [13, 13],
  popupAnchor: [0, -13],
});

const volunteerPinIcon = L.divIcon({
  className: 'custom-pin pin-volunteer',
  html: '<span>🦺</span>',
  iconSize: [26, 26],
  iconAnchor: [13, 13],
  popupAnchor: [0, -13],
});

export const LiveMapPage: React.FC = () => {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [shelters, setShelters] = useState<Shelter[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedIncidentForAssign, setSelectedIncidentForAssign] = useState<Incident | null>(null);

  // Filters
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showShelters, setShowShelters] = useState(true);
  const [showVolunteers, setShowVolunteers] = useState(true);

  // Real-time socket state
  const { socket, liveVolunteers, latestSosAlert, clearLatestSosAlert, isConnected } = useSocket();

  const defaultCenter: [number, number] = [12.9716, 77.5946];

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [incidentsData, sheltersData] = await Promise.all([
        incidentApi.getAll(),
        shelterApi.getAll().catch(() => []),
      ]);
      setIncidents(incidentsData);
      setShelters(sheltersData);
    } catch (err) {
      console.error('Failed to load map data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Subscribe to real-time socket events
  useEffect(() => {
    if (!socket) return;

    // 1. On new incident/SOS reported: prepend to list without refresh
    const handleNewIncident = (newInc: Incident) => {
      console.log('⚡ [LiveMap] Appending new incident live:', newInc.id);
      setIncidents((prev) => {
        if (prev.find((i) => i.id === newInc.id)) return prev;
        return [newInc, ...prev];
      });
    };

    // 2. On status change: update status live
    const handleStatusChange = (updatedInc: Incident) => {
      console.log('⚡ [LiveMap] Updating incident status live:', updatedInc.id, updatedInc.status);
      setIncidents((prev) =>
        prev.map((i) => (i.id === updatedInc.id ? { ...i, ...updatedInc } : i))
      );
    };

    socket.on('incident:new', handleNewIncident);
    socket.on('incident:statusChange', handleStatusChange);

    return () => {
      socket.off('incident:new', handleNewIncident);
      socket.off('incident:statusChange', handleStatusChange);
    };
  }, [socket]);

  const handleVerify = async (id: string, verified: boolean) => {
    try {
      await incidentApi.update(id, { verified });
      fetchData();
    } catch (err) {
      console.error('Failed to update verification:', err);
    }
  };

  // Filtered lists
  const filteredIncidents = incidents.filter((inc) => {
    if (severityFilter !== 'all' && inc.severity !== severityFilter) return false;
    if (statusFilter !== 'all' && inc.status !== statusFilter) return false;
    return true;
  });

  // Summary Metrics
  const criticalCount = incidents.filter((i) => i.severity === 'critical' && i.status !== 'resolved').length;
  const pendingCount = incidents.filter((i) => i.status === 'pending').length;
  const assignedCount = incidents.filter((i) => i.status === 'assigned' || i.status === 'in_progress').length;
  const resolvedCount = incidents.filter((i) => i.status === 'resolved').length;

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-61px)] relative">
      {/* Real-time SOS Alert Floating Toast */}
      {latestSosAlert && (
        <div className="absolute top-16 right-6 z-50 bg-red-600 text-white p-4 rounded-2xl shadow-2xl border border-red-400 max-w-md animate-bounce">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2 font-black text-sm">
              <span className="text-xl">🚨</span>
              <span>EMERGENCY SOS BROADCAST</span>
            </div>
            <button
              onClick={clearLatestSosAlert}
              className="text-red-200 hover:text-white p-1 rounded-lg"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <p className="text-xs text-red-100 mt-1.5 line-clamp-2">{latestSosAlert.description}</p>
          <div className="flex items-center justify-between mt-3">
            <span className="text-[11px] font-mono text-red-200">
              GPS: {latestSosAlert.lat.toFixed(4)}, {latestSosAlert.lng.toFixed(4)}
            </span>
            <button
              onClick={() => {
                setSelectedIncidentForAssign(latestSosAlert);
                clearLatestSosAlert();
              }}
              className="bg-white text-red-700 hover:bg-red-50 px-3 py-1 rounded-xl text-xs font-bold shadow-md"
            >
              Dispatch Nearest Unit
            </button>
          </div>
        </div>
      )}

      {/* Top Stats Bar */}
      <div className="bg-slate-950 border-b border-slate-800 px-6 py-3 flex items-center justify-between z-10">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold text-slate-400 uppercase">Live Socket Feed:</span>
            <span
              className={`flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-lg border ${
                isConnected
                  ? 'bg-emerald-950 text-emerald-400 border-emerald-800'
                  : 'bg-amber-950 text-amber-400 border-amber-800'
              }`}
            >
              <Radio className="w-3.5 h-3.5 animate-pulse" />
              {isConnected ? 'Connected' : 'Reconnecting...'}
            </span>
          </div>

          <div className="hidden lg:flex items-center space-x-3 text-xs">
            <span className="flex items-center gap-1 bg-red-950/80 border border-red-800 text-red-400 px-2.5 py-1 rounded-lg font-bold">
              <AlertCircle className="w-3.5 h-3.5" />
              {criticalCount} Critical
            </span>
            <span className="bg-amber-950/60 border border-amber-800 text-amber-400 px-2 py-0.5 rounded-md font-semibold">
              {pendingCount} Pending
            </span>
            <span className="bg-indigo-950/60 border border-indigo-800 text-indigo-400 px-2 py-0.5 rounded-md font-semibold">
              {assignedCount} In Action
            </span>
            <span className="bg-emerald-950/60 border border-emerald-800 text-emerald-400 px-2 py-0.5 rounded-md font-semibold">
              {resolvedCount} Resolved
            </span>
            <span className="bg-slate-800 text-emerald-400 px-2 py-0.5 rounded-md font-bold flex items-center gap-1">
              <Users className="w-3 h-3" />
              {liveVolunteers.length} Volunteers Online
            </span>
          </div>
        </div>

        {/* Filter Controls & Refresh */}
        <div className="flex items-center space-x-3 text-xs">
          <div className="flex items-center space-x-1 bg-slate-900 border border-slate-700 px-2.5 py-1 rounded-lg">
            <Filter className="w-3 h-3 text-slate-400" />
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="bg-transparent text-slate-200 font-semibold focus:outline-none cursor-pointer"
            >
              <option value="all" className="bg-slate-900">All Severities</option>
              <option value="critical" className="bg-slate-900">Critical Only</option>
              <option value="high" className="bg-slate-900">High</option>
              <option value="medium" className="bg-slate-900">Medium</option>
              <option value="low" className="bg-slate-900">Low</option>
            </select>
          </div>

          <div className="flex items-center space-x-1 bg-slate-900 border border-slate-700 px-2.5 py-1 rounded-lg">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-transparent text-slate-200 font-semibold focus:outline-none cursor-pointer"
            >
              <option value="all" className="bg-slate-900">All Statuses</option>
              <option value="pending" className="bg-slate-900">Pending Review</option>
              <option value="assigned" className="bg-slate-900">Assigned</option>
              <option value="in_progress" className="bg-slate-900">In Progress</option>
              <option value="resolved" className="bg-slate-900">Resolved</option>
            </select>
          </div>

          <button
            onClick={() => setShowVolunteers(!showVolunteers)}
            className={`flex items-center space-x-1 px-2.5 py-1 rounded-lg border font-semibold transition ${
              showVolunteers
                ? 'bg-emerald-950 border-emerald-800 text-emerald-400'
                : 'bg-slate-900 border-slate-700 text-slate-400'
            }`}
          >
            <Users className="w-3 h-3" />
            <span>Volunteers ({liveVolunteers.length})</span>
          </button>

          <button
            onClick={() => setShowShelters(!showShelters)}
            className={`flex items-center space-x-1 px-2.5 py-1 rounded-lg border font-semibold transition ${
              showShelters
                ? 'bg-emerald-950 border-emerald-800 text-emerald-400'
                : 'bg-slate-900 border-slate-700 text-slate-400'
            }`}
          >
            <Home className="w-3 h-3" />
            <span>Shelters</span>
          </button>

          <button
            onClick={fetchData}
            disabled={isLoading}
            className="flex items-center space-x-1 bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1 rounded-lg font-bold border border-slate-700 transition"
          >
            <RefreshCw className={`w-3 h-3 ${isLoading ? 'animate-spin text-red-400' : ''}`} />
            <span>Sync</span>
          </button>
        </div>
      </div>

      {/* Interactive Leaflet Map */}
      <div className="flex-1 w-full relative z-0">
        <MapContainer
          center={defaultCenter}
          zoom={13}
          style={{ width: '100%', height: '100%' }}
          zoomControl={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {/* Incident Pins */}
          {filteredIncidents.map((incident) => {
            const isSos = incident.type.toLowerCase().includes('sos');
            const hasMedia = incident.media && incident.media.length > 0;
            const photoUrl = hasMedia ? `${SERVER_URL}${incident.media![0].path}` : null;

            return (
              <Marker
                key={incident.id}
                position={[incident.lat, incident.lng]}
                icon={createPinIcon(incident.severity, isSos)}
              >
                <Popup className="custom-popup" maxWidth={320}>
                  <div className="p-1 space-y-2 text-slate-900">
                    <div className="flex items-center justify-between">
                      <h4 className="font-extrabold text-sm text-slate-900 flex items-center gap-1.5">
                        {isSos && <span className="text-red-600">🚨</span>}
                        {incident.type}
                      </h4>
                      <StatusBadge severity={incident.severity} />
                    </div>

                    <p className="text-xs text-slate-700 leading-relaxed">{incident.description}</p>

                    {photoUrl && (
                      <div className="rounded-lg overflow-hidden border border-slate-200 max-h-28 bg-slate-100">
                        <img
                          src={photoUrl}
                          alt="Incident scene"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}

                    <div className="text-[11px] text-slate-500 pt-1 border-t border-slate-100 flex items-center justify-between">
                      <span>Status: <StatusBadge status={incident.status} /></span>
                      <span>{new Date(incident.createdAt).toLocaleTimeString()}</span>
                    </div>

                    {/* Action buttons inside Popup */}
                    <div className="flex items-center gap-1.5 pt-2">
                      <button
                        onClick={() => setSelectedIncidentForAssign(incident)}
                        className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-1.5 px-2 rounded-lg text-xs flex items-center justify-center gap-1 shadow-sm transition"
                      >
                        <UserCheck className="w-3.5 h-3.5" />
                        <span>Dispatch Volunteer</span>
                      </button>

                      <button
                        onClick={() => handleVerify(incident.id, !incident.verified)}
                        className={`p-1.5 rounded-lg border text-xs font-semibold flex items-center justify-center transition ${
                          incident.verified
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                            : 'bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200'
                        }`}
                        title={incident.verified ? 'Verified Incident' : 'Click to Verify'}
                      >
                        <ShieldCheck className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </Popup>
              </Marker>
            );
          })}

          {/* Real-time Volunteer Location Pins */}
          {showVolunteers &&
            liveVolunteers.map((vol) => (
              <Marker
                key={vol.userId}
                position={[vol.lat, vol.lng]}
                icon={volunteerPinIcon}
              >
                <Popup maxWidth={260}>
                  <div className="p-1 space-y-1 text-slate-900">
                    <h4 className="font-bold text-sm flex items-center gap-1.5 text-emerald-800">
                      <span>🦺</span> {vol.name}
                    </h4>
                    <p className="text-xs text-slate-600">Active Volunteer Responder</p>
                    <div className="text-[11px] text-slate-500 pt-1 border-t border-slate-100">
                      <span>Last live ping: {new Date(vol.lastSeenAt).toLocaleTimeString()}</span>
                    </div>
                  </div>
                </Popup>
              </Marker>
            ))}

          {/* Shelter Pins */}
          {showShelters &&
            shelters.map((shelter) => (
              <Marker
                key={shelter.id}
                position={[shelter.lat, shelter.lng]}
                icon={shelterPinIcon}
              >
                <Popup maxWidth={260}>
                  <div className="p-1 space-y-1.5 text-slate-900">
                    <h4 className="font-bold text-sm flex items-center gap-1 text-emerald-800">
                      <span>🏠</span> {shelter.name}
                    </h4>
                    <div className="text-xs text-slate-600 space-y-1">
                      <div className="flex justify-between">
                        <span>Capacity:</span>
                        <span className="font-bold text-slate-800">{shelter.capacity} persons</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Current Occupancy:</span>
                        <span className="font-bold text-slate-800">{shelter.occupancy}</span>
                      </div>
                    </div>
                  </div>
                </Popup>
              </Marker>
            ))}
        </MapContainer>
      </div>

      {/* Volunteer Assignment Modal */}
      {selectedIncidentForAssign && (
        <AssignVolunteerModal
          incident={selectedIncidentForAssign}
          onClose={() => setSelectedIncidentForAssign(null)}
          onAssigned={fetchData}
        />
      )}
    </div>
  );
};
