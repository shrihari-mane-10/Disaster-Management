import React, { useState, useEffect } from 'react';
import { shelterApi } from '../lib/api';
import { Shelter } from '../types';
import { Home, Plus, Edit2, Trash2, RefreshCw, X, AlertCircle, Users } from 'lucide-react';

export const SheltersPage: React.FC = () => {
  const [shelters, setShelters] = useState<Shelter[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingShelter, setEditingShelter] = useState<Shelter | null>(null);

  // Form State
  const [formName, setFormName] = useState('');
  const [formCapacity, setFormCapacity] = useState(300);
  const [formOccupancy, setFormOccupancy] = useState(0);
  const [formLat, setFormLat] = useState('12.9740');
  const [formLng, setFormLng] = useState('77.5920');
  const [formError, setFormError] = useState<string | null>(null);

  const fetchShelters = async () => {
    setIsLoading(true);
    try {
      const data = await shelterApi.getAll();
      setShelters(data);
    } catch (err) {
      console.error('Failed to fetch shelters:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchShelters();
  }, []);

  const openCreateModal = () => {
    setEditingShelter(null);
    setFormName('');
    setFormCapacity(300);
    setFormOccupancy(0);
    setFormLat('12.9740');
    setFormLng('77.5920');
    setFormError(null);
    setModalOpen(true);
  };

  const openEditModal = (s: Shelter) => {
    setEditingShelter(s);
    setFormName(s.name);
    setFormCapacity(s.capacity);
    setFormOccupancy(s.occupancy);
    setFormLat(String(s.lat));
    setFormLng(String(s.lng));
    setFormError(null);
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      setFormError('Shelter name is required');
      return;
    }

    try {
      if (editingShelter) {
        await shelterApi.update(editingShelter.id, {
          name: formName.trim(),
          capacity: Number(formCapacity),
          occupancy: Number(formOccupancy),
          lat: Number(formLat),
          lng: Number(formLng),
        });
      } else {
        await shelterApi.create({
          name: formName.trim(),
          capacity: Number(formCapacity),
          occupancy: Number(formOccupancy),
          lat: Number(formLat),
          lng: Number(formLng),
        });
      }
      setModalOpen(false);
      fetchShelters();
    } catch (err: any) {
      setFormError(err.response?.data?.error || err.message || 'Failed to save shelter');
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this relief shelter record?')) {
      try {
        await shelterApi.delete(id);
        fetchShelters();
      } catch (err) {
        console.error('Failed to delete shelter:', err);
      }
    }
  };

  return (
    <div className="flex-1 bg-slate-900 p-6 overflow-y-auto">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-black text-white flex items-center gap-2.5">
              <Home className="w-6 h-6 text-red-500" />
              <span>Relief Shelters & Evacuation Centers</span>
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Monitor shelter capacities, live occupancy rates, and safety accommodations.
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={fetchShelters}
              disabled={isLoading}
              className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 px-3.5 py-2 rounded-xl text-xs font-bold border border-slate-700 transition"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-red-400' : ''}`} />
              <span>Refresh</span>
            </button>

            <button
              onClick={openCreateModal}
              className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-lg shadow-red-600/30 transition"
            >
              <Plus className="w-4 h-4" />
              <span>Add Shelter</span>
            </button>
          </div>
        </div>

        {/* Shelters Table */}
        <div className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900/80 border-b border-slate-800 text-slate-400 font-bold uppercase tracking-wider">
              <tr>
                <th className="px-5 py-3.5">Shelter Name & Facility</th>
                <th className="px-5 py-3.5">Capacity & Occupancy</th>
                <th className="px-5 py-3.5">Occupancy Rate</th>
                <th className="px-5 py-3.5">Coordinates</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="text-center py-16 text-slate-400">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500 mx-auto mb-2"></div>
                    <span>Loading shelter data...</span>
                  </td>
                </tr>
              ) : shelters.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-12 text-slate-400">
                    No shelters recorded. Click "Add Shelter" to create one.
                  </td>
                </tr>
              ) : (
                shelters.map((shelter) => {
                  const percent = Math.min(100, Math.round((shelter.occupancy / shelter.capacity) * 100)) || 0;
                  const isFull = percent >= 90;
                  return (
                    <tr key={shelter.id} className="hover:bg-slate-900/50 transition">
                      <td className="px-5 py-4 font-bold text-white text-sm">
                        {shelter.name}
                      </td>
                      <td className="px-5 py-4">
                        <span className="font-extrabold text-white text-sm">{shelter.occupancy}</span>
                        <span className="text-slate-400 text-xs"> / {shelter.capacity} max</span>
                      </td>
                      <td className="px-5 py-4 w-48">
                        <div className="space-y-1">
                          <div className="flex justify-between text-[11px] font-bold">
                            <span className={isFull ? 'text-red-400' : 'text-emerald-400'}>{percent}%</span>
                            <span className="text-slate-500">{isFull ? 'Near Full' : 'Available'}</span>
                          </div>
                          <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                isFull ? 'bg-red-500' : percent > 60 ? 'bg-yellow-500' : 'bg-emerald-500'
                              }`}
                              style={{ width: `${percent}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4 font-mono text-slate-400">
                        {shelter.lat.toFixed(4)}, {shelter.lng.toFixed(4)}
                      </td>
                      <td className="px-5 py-4 text-right space-x-2">
                        <button
                          onClick={() => openEditModal(shelter)}
                          className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-700 transition"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(shelter.id)}
                          className="p-1.5 bg-red-950/60 hover:bg-red-900 text-red-400 rounded-lg border border-red-800 transition"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
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

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md shadow-2xl p-6 text-slate-100">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <h3 className="text-lg font-bold text-white">
                {editingShelter ? 'Edit Shelter' : 'Add Relief Shelter'}
              </h3>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="flex items-center gap-2 p-3 mt-4 bg-red-950/60 border border-red-800 rounded-xl text-red-300 text-xs">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-4 mt-4 text-xs">
              <div>
                <label className="block text-slate-300 font-bold mb-1">Shelter / Facility Name</label>
                <input
                  type="text"
                  placeholder="e.g. Community Center Relief Camp"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-red-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Total Capacity</label>
                  <input
                    type="number"
                    min="1"
                    value={formCapacity}
                    onChange={(e) => setFormCapacity(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-red-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Current Occupancy</label>
                  <input
                    type="number"
                    min="0"
                    value={formOccupancy}
                    onChange={(e) => setFormOccupancy(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-red-500"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Latitude</label>
                  <input
                    type="number"
                    step="any"
                    value={formLat}
                    onChange={(e) => setFormLat(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-red-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Longitude</label>
                  <input
                    type="number"
                    step="any"
                    value={formLng}
                    onChange={(e) => setFormLng(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-red-500"
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-xl font-bold text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-red-600 hover:bg-red-700 rounded-xl font-bold text-white shadow-lg shadow-red-600/30"
                >
                  Save Shelter
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
