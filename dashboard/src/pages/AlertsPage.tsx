import React, { useState, useEffect } from 'react';
import { alertApi } from '../lib/api';
import { Alert, Severity } from '../types';
import { StatusBadge } from '../components/StatusBadge';
import {
  Radio,
  Send,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  Smartphone,
  Wifi,
  Filter,
} from 'lucide-react';

export const AlertsPage: React.FC = () => {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);

  // Form State
  const [message, setMessage] = useState('');
  const [severity, setSeverity] = useState<Severity>('critical');
  const [region, setRegion] = useState('All Disaster Zones');
  const [formError, setFormError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Filter State
  const [channelFilter, setChannelFilter] = useState<string>('all');
  const [severityFilter, setSeverityFilter] = useState<string>('all');

  const fetchAlerts = async () => {
    setIsLoading(true);
    try {
      const data = await alertApi.getAll();
      setAlerts(data);
    } catch (err) {
      console.error('Failed to fetch alerts:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, []);

  const handleBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) {
      setFormError('Alert warning message is required');
      return;
    }

    setIsSending(true);
    setFormError(null);
    setSuccessMsg(null);

    try {
      await alertApi.send({
        message: message.trim(),
        severity,
        region: region.trim() || undefined,
      });

      setSuccessMsg('Emergency alert broadcasted via Real-Time WebSockets and Simulated Cellular SMS!');
      setMessage('');
      fetchAlerts();

      setTimeout(() => {
        setSuccessMsg(null);
      }, 5000);
    } catch (err: any) {
      setFormError(err.response?.data?.error || err.message || 'Failed to dispatch alert');
    } finally {
      setIsSending(false);
    }
  };

  const filteredAlerts = alerts.filter((a) => {
    if (channelFilter !== 'all' && a.channel !== channelFilter) return false;
    if (severityFilter !== 'all' && a.severity !== severityFilter) return false;
    return true;
  });

  const socketAlertsCount = alerts.filter((a) => a.channel === 'socket').length;
  const smsAlertsCount = alerts.filter((a) => a.channel === 'sms_mock').length;

  return (
    <div className="flex-1 bg-slate-900 p-6 overflow-y-auto">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-black text-white flex items-center gap-2.5">
              <Radio className="w-6 h-6 text-red-500 animate-pulse" />
              <span>Emergency Broadcast & Warning System</span>
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Dispatch multi-channel emergency notifications to citizens and field rescue teams.
            </p>
          </div>

          <button
            onClick={fetchAlerts}
            disabled={isLoading}
            className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 px-3.5 py-2 rounded-xl text-xs font-bold border border-slate-700 transition self-start sm:self-auto"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-red-400' : ''}`} />
            <span>Refresh Sent Log</span>
          </button>
        </div>

        {/* Top Grid: Broadcast Form & Summary Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Broadcast Form (2 Cols) */}
          <div className="lg:col-span-2 bg-slate-950 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Send className="w-4 h-4 text-red-500" />
                <span>Issue Live Emergency Broadcast</span>
              </h3>
              <div className="flex items-center gap-2 text-[11px] font-semibold text-slate-400">
                <span className="flex items-center gap-1 text-emerald-400 bg-emerald-950/80 border border-emerald-800 px-2 py-0.5 rounded-full">
                  <Wifi className="w-3 h-3" /> Socket.IO
                </span>
                <span className="flex items-center gap-1 text-blue-400 bg-blue-950/80 border border-blue-800 px-2 py-0.5 rounded-full">
                  <Smartphone className="w-3 h-3" /> Mock SMS
                </span>
              </div>
            </div>

            {formError && (
              <div className="flex items-center gap-2 p-3 bg-red-950/60 border border-red-800 rounded-xl text-red-300 text-xs">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            {successMsg && (
              <div className="flex items-center gap-2 p-3 bg-emerald-950/60 border border-emerald-800 rounded-xl text-emerald-300 text-xs">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            <form onSubmit={handleBroadcast} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-bold mb-1.5 uppercase tracking-wider">
                  Emergency Alert Message
                </label>
                <textarea
                  rows={3}
                  placeholder="e.g. FLASH FLOOD WARNING: Evacuate low-lying river areas immediately. Emergency shelters are open at Main Camp."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700/80 rounded-xl p-3 text-white placeholder-slate-500 focus:outline-none focus:border-red-500 text-xs"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 font-bold mb-1.5 uppercase tracking-wider">
                    Severity Level
                  </label>
                  <select
                    value={severity}
                    onChange={(e) => setSeverity(e.target.value as Severity)}
                    className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-red-500 font-semibold"
                  >
                    <option value="critical" className="bg-slate-900">🚨 Critical / Life Threatening</option>
                    <option value="high" className="bg-slate-900">🔥 High Priority Alert</option>
                    <option value="medium" className="bg-slate-900">⚠️ Medium Warning</option>
                    <option value="low" className="bg-slate-900">ℹ️ Low / Informational</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1.5 uppercase tracking-wider">
                    Target Region / Zone
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. All Zones or Sector 4"
                    value={region}
                    onChange={(e) => setRegion(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-red-500 font-semibold"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSending}
                className="w-full bg-red-600 hover:bg-red-700 disabled:opacity-60 text-white font-bold py-3 rounded-xl shadow-lg shadow-red-600/30 transition flex items-center justify-center space-x-2 text-sm"
              >
                {isSending ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Broadcasting Alert...</span>
                  </>
                ) : (
                  <>
                    <Radio className="w-4 h-4" />
                    <span>Broadcast Emergency Alert Now</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Broadcast Stats Card (1 Col) */}
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col justify-between space-y-4">
            <div>
              <h3 className="text-sm font-bold text-white mb-2">Delivery Channels Overview</h3>
              <p className="text-xs text-slate-400">
                Multi-channel fallback ensures warnings reach all devices without requiring paid API services.
              </p>
            </div>

            <div className="space-y-3">
              <div className="p-3.5 bg-slate-900/80 rounded-xl border border-slate-800 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-emerald-950 text-emerald-400 rounded-lg border border-emerald-800">
                    <Wifi className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-xs text-white">Socket.IO Push</h4>
                    <p className="text-[10px] text-slate-400">Instant in-app notification</p>
                  </div>
                </div>
                <span className="font-mono font-bold text-emerald-400 text-sm">{socketAlertsCount} sent</span>
              </div>

              <div className="p-3.5 bg-slate-900/80 rounded-xl border border-slate-800 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-950 text-blue-400 rounded-lg border border-blue-800">
                    <Smartphone className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-xs text-white">Mock Cellular SMS</h4>
                    <p className="text-[10px] text-slate-400">Simulated carrier broadcast</p>
                  </div>
                </div>
                <span className="font-mono font-bold text-blue-400 text-sm">{smsAlertsCount} sent</span>
              </div>
            </div>

            <div className="text-[11px] text-slate-500 border-t border-slate-800 pt-3 flex items-center justify-between">
              <span>Total Broadcasts: {alerts.length}</span>
              <span className="text-emerald-400 font-semibold">● Gateway Online</span>
            </div>
          </div>
        </div>

        {/* Sent Log Table */}
        <div className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-xl space-y-4">
          <div className="p-4 border-b border-slate-800 flex flex-wrap items-center justify-between gap-4">
            <h3 className="text-sm font-bold text-white">Broadcast History & Sent Log</h3>

            <div className="flex items-center gap-3 text-xs">
              <div className="flex items-center space-x-2 bg-slate-900 border border-slate-700 px-3 py-1 rounded-xl">
                <Filter className="w-3 h-3 text-slate-400" />
                <select
                  value={channelFilter}
                  onChange={(e) => setChannelFilter(e.target.value)}
                  className="bg-transparent text-white font-semibold focus:outline-none cursor-pointer"
                >
                  <option value="all" className="bg-slate-900">All Channels</option>
                  <option value="socket" className="bg-slate-900">Socket.IO Only</option>
                  <option value="sms_mock" className="bg-slate-900">Mock SMS Only</option>
                </select>
              </div>

              <div className="flex items-center space-x-2 bg-slate-900 border border-slate-700 px-3 py-1 rounded-xl">
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

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900/80 border-b border-slate-800 text-slate-400 font-bold uppercase tracking-wider">
                <tr>
                  <th className="px-5 py-3.5">Timestamp</th>
                  <th className="px-5 py-3.5">Channel</th>
                  <th className="px-5 py-3.5">Severity</th>
                  <th className="px-5 py-3.5">Target Region</th>
                  <th className="px-5 py-3.5">Alert Broadcast Content</th>
                  <th className="px-5 py-3.5">Dispatched By</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="text-center py-16 text-slate-400">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500 mx-auto mb-2"></div>
                      <span>Loading alert log...</span>
                    </td>
                  </tr>
                ) : filteredAlerts.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-12 text-slate-400">
                      No broadcast records found.
                    </td>
                  </tr>
                ) : (
                  filteredAlerts.map((alert) => (
                    <tr key={alert.id} className="hover:bg-slate-900/50 transition">
                      <td className="px-5 py-4 font-mono text-[11px] text-slate-400">
                        {new Date(alert.createdAt).toLocaleString()}
                      </td>

                      <td className="px-5 py-4">
                        {alert.channel === 'socket' ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-950/80 border border-emerald-800 px-2 py-0.5 rounded-full">
                            <Wifi className="w-3 h-3" /> Socket.IO
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-400 bg-blue-950/80 border border-blue-800 px-2 py-0.5 rounded-full">
                            <Smartphone className="w-3 h-3" /> Mock SMS
                          </span>
                        )}
                      </td>

                      <td className="px-5 py-4">
                        <StatusBadge severity={alert.severity} />
                      </td>

                      <td className="px-5 py-4 font-semibold text-slate-200">
                        {alert.region || 'All Zones'}
                      </td>

                      <td className="px-5 py-4 max-w-md">
                        <p className="text-slate-200 line-clamp-2">{alert.message}</p>
                      </td>

                      <td className="px-5 py-4 text-xs text-slate-400">
                        {alert.creator?.name || 'Command Center'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
