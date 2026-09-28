import React, { useState, useEffect } from 'react';
import { Incident, VolunteerNearby } from '../types';
import { incidentApi } from '../lib/api';
import { UserCheck, MapPin, Phone, Clock, AlertCircle, X, CheckCircle2 } from 'lucide-react';

interface AssignVolunteerModalProps {
  incident: Incident | null;
  onClose: () => void;
  onAssigned: () => void;
}

export const AssignVolunteerModal: React.FC<AssignVolunteerModalProps> = ({
  incident,
  onClose,
  onAssigned,
}) => {
  const [volunteers, setVolunteers] = useState<VolunteerNearby[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedVolunteerId, setSelectedVolunteerId] = useState<string | null>(null);
  const [isAssigning, setIsAssigning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    if (incident) {
      fetchNearby();
    }
  }, [incident]);

  const fetchNearby = async () => {
    if (!incident) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await incidentApi.getNearbyVolunteers(incident.id);
      setVolunteers(data.volunteers);
      if (data.volunteers.length > 0) {
        setSelectedVolunteerId(data.volunteers[0].id);
      }
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'Failed to fetch nearby volunteers');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAssign = async () => {
    if (!incident || !selectedVolunteerId) return;
    setIsAssigning(true);
    setError(null);
    try {
      await incidentApi.assignVolunteer(incident.id, selectedVolunteerId);
      setSuccessMsg('Volunteer assigned successfully! Task dispatched.');
      setTimeout(() => {
        onAssigned();
        onClose();
      }, 1200);
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'Failed to assign volunteer');
    } finally {
      setIsAssigning(false);
    }
  };

  if (!incident) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-red-600/20 text-red-500 rounded-lg">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Dispatch Volunteer</h3>
              <p className="text-xs text-slate-400">
                Target Incident: <span className="font-semibold text-slate-200">{incident.type}</span> (#{incident.id.slice(0, 8)})
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-4 max-h-[65vh] overflow-y-auto">
          {/* Incident summary banner */}
          <div className="bg-slate-800/80 rounded-xl p-4 border border-slate-700/60 text-sm">
            <p className="text-slate-300 line-clamp-2">{incident.description}</p>
            <div className="flex items-center gap-4 mt-2 text-xs text-slate-400">
              <span className="flex items-center gap-1 text-slate-300">
                <MapPin className="w-3.5 h-3.5 text-red-400" />
                {incident.lat.toFixed(4)}, {incident.lng.toFixed(4)}
              </span>
              <span className="uppercase font-bold text-red-400">Severity: {incident.severity}</span>
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3.5 bg-red-950/60 border border-red-800 rounded-xl text-red-300 text-sm">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="flex items-center gap-2 p-3.5 bg-emerald-950/60 border border-emerald-800 rounded-xl text-emerald-300 text-sm">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
              <span>{successMsg}</span>
            </div>
          )}

          <h4 className="text-sm font-semibold text-slate-200 flex items-center justify-between">
            <span>Available Volunteers (Sorted by Haversine Distance)</span>
            <span className="text-xs font-normal text-slate-400">Active within 5 mins</span>
          </h4>

          {isLoading ? (
            <div className="py-12 flex flex-col items-center justify-center text-slate-400 space-y-2">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500"></div>
              <p className="text-xs">Finding nearest active responders...</p>
            </div>
          ) : volunteers.length === 0 ? (
            <div className="py-8 px-4 text-center bg-slate-800/40 border border-dashed border-slate-700 rounded-xl">
              <p className="text-sm font-semibold text-slate-300">No active volunteers nearby</p>
              <p className="text-xs text-slate-400 mt-1">
                No volunteers with active GPS ping in the last 5 minutes were found.
              </p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {volunteers.map((vol, index) => {
                const isSelected = selectedVolunteerId === vol.id;
                return (
                  <div
                    key={vol.id}
                    onClick={() => setSelectedVolunteerId(vol.id)}
                    className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                      isSelected
                        ? 'bg-red-950/40 border-red-600 shadow-md shadow-red-900/20'
                        : 'bg-slate-800/50 border-slate-700/80 hover:bg-slate-800 hover:border-slate-600'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
                          index === 0
                            ? 'bg-emerald-600 text-white'
                            : 'bg-slate-700 text-slate-300'
                        }`}
                      >
                        {index === 0 ? '★ 1' : index + 1}
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-semibold text-sm text-white">{vol.name}</span>
                          {index === 0 && (
                            <span className="bg-emerald-950 text-emerald-400 border border-emerald-800 text-[10px] px-1.5 py-0.2 rounded font-bold">
                              NEAREST
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-3 text-xs text-slate-400 mt-0.5">
                          <span className="flex items-center gap-1">
                            <Phone className="w-3 h-3 text-slate-500" />
                            {vol.phone || 'No phone'}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3 text-slate-500" />
                            {vol.lastSeenAt ? new Date(vol.lastSeenAt).toLocaleTimeString() : 'Active'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-sm font-bold text-red-400">
                        {vol.distanceKm < 1
                          ? `${(vol.distanceKm * 1000).toFixed(0)} m`
                          : `${vol.distanceKm.toFixed(2)} km`}
                      </span>
                      <p className="text-[10px] text-slate-500">away</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end space-x-3 px-6 py-4 border-t border-slate-800 bg-slate-950">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-300 hover:bg-slate-800 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleAssign}
            disabled={!selectedVolunteerId || isAssigning || volunteers.length === 0}
            className="px-5 py-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white rounded-xl text-sm font-bold shadow-lg shadow-red-600/30 transition flex items-center space-x-2"
          >
            {isAssigning ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Assigning...</span>
              </>
            ) : (
              <span>Dispatch Selected Volunteer</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
