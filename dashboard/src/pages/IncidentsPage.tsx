import React, { useState, useEffect } from 'react';
import { incidentApi, SERVER_URL } from '../lib/api';
import { Incident, IncidentStatus, Severity } from '../types';
import { StatusBadge } from '../components/StatusBadge';
import { AssignVolunteerModal } from '../components/AssignVolunteerModal';
import { useSocket } from '../context/SocketContext';
import {
  AlertTriangle,
  Search,
  RefreshCw,
  UserCheck,
  CheckCircle,
  XCircle,
  Image as ImageIcon,
} from 'lucide-react';

export const IncidentsPage: React.FC = () => {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [severityFilter, setSeverityFilter] = useState<string>('all');

  const [selectedIncidentForAssign, setSelectedIncidentForAssign] = useState<Incident | null>(null);

  const { socket } = useSocket();

  const fetchIncidents = async () => {
    setIsLoading(true);
    try {
      const data = await incidentApi.getAll();
      setIncidents(data);
    } catch (err) {
      console.error('Failed to fetch incidents:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchIncidents();
  }, []);

  // Real-time updates from Socket.IO
  useEffect(() => {
    if (!socket) return;

    const handleNewIncident = (newInc: Incident) => {
      setIncidents((prev) => {
        if (prev.find((i) => i.id === newInc.id)) return prev;
        return [newInc, ...prev];
      });
    };

    const handleStatusChange = (updatedInc: Incident) => {
      setIncidents((prev) =>
        prev.map((i) => (i.id === updatedInc.id ? { ...i, ...updatedInc } : i))
      );
    };

    socket.on('incident:new', handleNewIncident);
    socket.on('incident:statusChange', handleStatusChange);
    socket.on('task:assigned', fetchIncidents);

    return () => {
      socket.off('incident:new', handleNewIncident);
      socket.off('incident:statusChange', handleStatusChange);
      socket.off('task:assigned', fetchIncidents);
    };
  }, [socket]);


  const handleUpdateStatus = async (id: string, status: IncidentStatus) => {
    try {
      await incidentApi.update(id, { status });
      fetchIncidents();
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  const handleToggleVerify = async (id: string, currentVerified: boolean) => {
    try {
      await incidentApi.update(id, { verified: !currentVerified });
      fetchIncidents();
    } catch (err) {
      console.error('Failed to toggle verification:', err);
    }
  };

  const filteredIncidents = incidents.filter((inc) => {
    if (statusFilter !== 'all' && inc.status !== statusFilter) return false;
    if (severityFilter !== 'all' && inc.severity !== severityFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchType = inc.type.toLowerCase().includes(q);
      const matchDesc = inc.description.toLowerCase().includes(q);
      const matchReporter = inc.reporter?.name.toLowerCase().includes(q);
      if (!matchType && !matchDesc && !matchReporter) return false;
    }
    return true;
  });

  return (
    <div className="flex-1 bg-slate-900 p-6 overflow-y-auto">
      {/* Top Header & Search/Filters */}
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-black text-white flex items-center gap-2.5">
              <AlertTriangle className="w-6 h-6 text-red-500" />
              <span>Incident Response & Dispatch Hub</span>
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Verify citizen reports, assess severity levels, and assign rescue teams.
            </p>
          </div>

          <button
            onClick={fetchIncidents}
            disabled={isLoading}
            className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 px-4 py-2 rounded-xl text-xs font-bold border border-slate-700 transition self-start sm:self-auto"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-red-400' : ''}`} />
            <span>Refresh Table</span>
          </button>
        </div>

        {/* Filter Toolbar */}
        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4 shadow-sm">
          {/* Search */}
          <div className="relative flex-1 min-w-[240px]">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search by incident category, description, reporter..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700/80 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-red-500"
            />
          </div>

          {/* Select Filters */}
          <div className="flex flex-wrap items-center gap-3 text-xs">
            <div className="flex items-center space-x-2 bg-slate-900 border border-slate-700 px-3 py-1.5 rounded-xl">
              <span className="text-slate-400 font-medium">Status:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-transparent text-white font-semibold focus:outline-none cursor-pointer"
              >
                <option value="all" className="bg-slate-900">All Statuses</option>
                <option value="pending" className="bg-slate-900">Pending Review</option>
                <option value="assigned" className="bg-slate-900">Assigned</option>
                <option value="in_progress" className="bg-slate-900">In Progress</option>
                <option value="resolved" className="bg-slate-900">Resolved</option>
                <option value="rejected" className="bg-slate-900">Rejected</option>
              </select>
            </div>

            <div className="flex items-center space-x-2 bg-slate-900 border border-slate-700 px-3 py-1.5 rounded-xl">
              <span className="text-slate-400 font-medium">Severity:</span>
              <select
                value={severityFilter}
                onChange={(e) => setSeverityFilter(e.target.value)}
                className="bg-transparent text-white font-semibold focus:outline-none cursor-pointer"
              >
                <option value="all" className="bg-slate-900">All Severities</option>
                <option value="critical" className="bg-slate-900">Critical</option>
                <option value="high" className="bg-slate-900">High</option>
                <option value="medium" className="bg-slate-900">Medium</option>
                <option value="low" className="bg-slate-900">Low</option>
              </select>
            </div>
          </div>
        </div>

        {/* Data Table */}
        <div className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900/80 border-b border-slate-800 text-slate-400 font-bold uppercase tracking-wider">
                <tr>
                  <th className="px-5 py-3.5">Incident / Type</th>
                  <th className="px-5 py-3.5">Severity</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5">Location (GPS)</th>
                  <th className="px-5 py-3.5">Reporter</th>
                  <th className="px-5 py-3.5">Verification</th>
                  <th className="px-5 py-3.5 text-right">Dispatch Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {isLoading ? (
                  <tr>
                    <td colSpan={7} className="text-center py-16 text-slate-400">
                      <div className="flex flex-col items-center justify-center space-y-2">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500"></div>
                        <span>Loading emergency incidents...</span>
                      </div>
                    </td>
                  </tr>
                ) : filteredIncidents.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-12 text-slate-400">
                      No incidents matching your filter criteria.
                    </td>
                  </tr>
                ) : (
                  filteredIncidents.map((inc) => {
                    const hasMedia = inc.media && inc.media.length > 0;
                    return (
                      <tr key={inc.id} className="hover:bg-slate-900/50 transition">
                        {/* Incident Type & Description */}
                        <td className="px-5 py-4">
                          <div className="space-y-1 max-w-xs">
                            <div className="flex items-center space-x-2">
                              <span className="font-extrabold text-white text-sm">{inc.type}</span>
                              {hasMedia && (
                                <span className="flex items-center text-[10px] text-blue-400 bg-blue-950/60 border border-blue-800 px-1.5 py-0.2 rounded font-medium">
                                  <ImageIcon className="w-3 h-3 mr-0.5" /> Photo
                                </span>
                              )}
                            </div>
                            <p className="text-slate-400 text-xs line-clamp-1">{inc.description}</p>
                            <p className="text-[10px] text-slate-500">
                              {new Date(inc.createdAt).toLocaleString()}
                            </p>
                          </div>
                        </td>

                        {/* Severity */}
                        <td className="px-5 py-4">
                          <StatusBadge severity={inc.severity} />
                        </td>

                        {/* Status */}
                        <td className="px-5 py-4">
                          <StatusBadge status={inc.status} />
                        </td>

                        {/* Location */}
                        <td className="px-5 py-4 font-mono text-[11px] text-slate-300">
                          {inc.lat.toFixed(4)}, {inc.lng.toFixed(4)}
                        </td>

                        {/* Reporter */}
                        <td className="px-5 py-4 text-xs">
                          {inc.reporter ? (
                            <div>
                              <p className="font-semibold text-slate-200">{inc.reporter.name}</p>
                              <p className="text-[10px] text-slate-400">{inc.reporter.phone || inc.reporter.email}</p>
                            </div>
                          ) : (
                            <span className="text-slate-500 italic">Anonymous</span>
                          )}
                        </td>

                        {/* Verification */}
                        <td className="px-5 py-4">
                          <button
                            onClick={() => handleToggleVerify(inc.id, inc.verified)}
                            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold border transition ${
                              inc.verified
                                ? 'bg-emerald-950 text-emerald-300 border-emerald-800 hover:bg-emerald-900'
                                : 'bg-slate-900 text-slate-400 border-slate-700 hover:border-slate-500 hover:text-white'
                            }`}
                          >
                            <CheckCircle className="w-3.5 h-3.5" />
                            <span>{inc.verified ? 'Verified' : 'Verify'}</span>
                          </button>
                        </td>

                        {/* Actions */}
                        <td className="px-5 py-4 text-right space-x-2">
                          <button
                            onClick={() => setSelectedIncidentForAssign(inc)}
                            className="bg-red-600 hover:bg-red-700 text-white font-bold px-3 py-1.5 rounded-lg text-xs shadow-sm inline-flex items-center gap-1 transition"
                          >
                            <UserCheck className="w-3.5 h-3.5" />
                            <span>Dispatch</span>
                          </button>

                          <button
                            onClick={() => handleUpdateStatus(inc.id, 'rejected')}
                            className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold px-2 py-1.5 rounded-lg text-xs border border-slate-700 transition"
                            title="Reject/Dismiss"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Volunteer Assignment Modal */}
      {selectedIncidentForAssign && (
        <AssignVolunteerModal
          incident={selectedIncidentForAssign}
          onClose={() => setSelectedIncidentForAssign(null)}
          onAssigned={fetchIncidents}
        />
      )}
    </div>
  );
};
