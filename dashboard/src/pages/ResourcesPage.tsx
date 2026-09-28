import React, { useState, useEffect } from 'react';
import { resourceApi } from '../lib/api';
import { Resource } from '../types';
import { Package, Plus, Edit2, Trash2, RefreshCw, X, AlertCircle } from 'lucide-react';

export const ResourcesPage: React.FC = () => {
  const [resources, setResources] = useState<Resource[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingResource, setEditingResource] = useState<Resource | null>(null);

  // Form State
  const [formType, setFormType] = useState('');
  const [formQuantity, setFormQuantity] = useState(10);
  const [formStatus, setFormStatus] = useState('available');
  const [formLat, setFormLat] = useState<string>('12.9716');
  const [formLng, setFormLng] = useState<string>('77.5946');
  const [formError, setFormError] = useState<string | null>(null);

  const fetchResources = async () => {
    setIsLoading(true);
    try {
      const data = await resourceApi.getAll();
      setResources(data);
    } catch (err) {
      console.error('Failed to fetch resources:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchResources();
  }, []);

  const openCreateModal = () => {
    setEditingResource(null);
    setFormType('');
    setFormQuantity(50);
    setFormStatus('available');
    setFormLat('12.9716');
    setFormLng('77.5946');
    setFormError(null);
    setModalOpen(true);
  };

  const openEditModal = (res: Resource) => {
    setEditingResource(res);
    setFormType(res.type);
    setFormQuantity(res.quantity);
    setFormStatus(res.status);
    setFormLat(res.lat ? String(res.lat) : '');
    setFormLng(res.lng ? String(res.lng) : '');
    setFormError(null);
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formType.trim()) {
      setFormError('Resource type is required');
      return;
    }

    try {
      if (editingResource) {
        await resourceApi.update(editingResource.id, {
          type: formType.trim(),
          quantity: Number(formQuantity),
          status: formStatus,
          lat: formLat ? Number(formLat) : null,
          lng: formLng ? Number(formLng) : null,
        });
      } else {
        await resourceApi.create({
          type: formType.trim(),
          quantity: Number(formQuantity),
          status: formStatus,
          lat: formLat ? Number(formLat) : null,
          lng: formLng ? Number(formLng) : null,
        });
      }
      setModalOpen(false);
      fetchResources();
    } catch (err: any) {
      setFormError(err.response?.data?.error || err.message || 'Failed to save resource');
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this resource record?')) {
      try {
        await resourceApi.delete(id);
        fetchResources();
      } catch (err) {
        console.error('Failed to delete resource:', err);
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
              <Package className="w-6 h-6 text-red-500" />
              <span>Emergency Supply & Resource Inventory</span>
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Manage relief stock, medical kits, inflatable boats, and rations.
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={fetchResources}
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
              <span>Add Resource</span>
            </button>
          </div>
        </div>

        {/* Resource Table */}
        <div className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900/80 border-b border-slate-800 text-slate-400 font-bold uppercase tracking-wider">
              <tr>
                <th className="px-5 py-3.5">Resource Description</th>
                <th className="px-5 py-3.5">Quantity</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5">Storage Location</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="text-center py-16 text-slate-400">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500 mx-auto mb-2"></div>
                    <span>Loading resources...</span>
                  </td>
                </tr>
              ) : resources.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-12 text-slate-400">
                    No resources recorded. Click "Add Resource" to create one.
                  </td>
                </tr>
              ) : (
                resources.map((res) => (
                  <tr key={res.id} className="hover:bg-slate-900/50 transition">
                    <td className="px-5 py-4 font-bold text-white text-sm">
                      {res.type}
                    </td>
                    <td className="px-5 py-4 font-extrabold text-red-400 text-sm">
                      {res.quantity.toLocaleString()} units
                    </td>
                    <td className="px-5 py-4">
                      <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-800 uppercase">
                        {res.status}
                      </span>
                    </td>
                    <td className="px-5 py-4 font-mono text-slate-400">
                      {res.lat && res.lng ? `${res.lat.toFixed(4)}, ${res.lng.toFixed(4)}` : 'Depot / Base'}
                    </td>
                    <td className="px-5 py-4 text-right space-x-2">
                      <button
                        onClick={() => openEditModal(res)}
                        className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-700 transition"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(res.id)}
                        className="p-1.5 bg-red-950/60 hover:bg-red-900 text-red-400 rounded-lg border border-red-800 transition"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
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
                {editingResource ? 'Edit Resource' : 'Add New Emergency Resource'}
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
                <label className="block text-slate-300 font-bold mb-1">Resource Type / Item Name</label>
                <input
                  type="text"
                  placeholder="e.g. Drinking Water Packs (10L)"
                  value={formType}
                  onChange={(e) => setFormType(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-red-500"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Quantity Available</label>
                <input
                  type="number"
                  min="0"
                  value={formQuantity}
                  onChange={(e) => setFormQuantity(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-red-500"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Status</label>
                <select
                  value={formStatus}
                  onChange={(e) => setFormStatus(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-red-500"
                >
                  <option value="available">Available</option>
                  <option value="depleted">Depleted</option>
                  <option value="reserved">Reserved</option>
                </select>
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
                  Save Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
