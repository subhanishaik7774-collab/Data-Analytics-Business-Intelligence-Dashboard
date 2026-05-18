import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { 
  Target, 
  Plus, 
  X,
  PlusCircle,
  HelpCircle,
  TrendingUp,
  AlertOctagon,
  Sparkles
} from 'lucide-react';
import KPICard from '../components/KPICard';
import { useAuth } from '../context/AuthContext';

export default function KPIs() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const [kpis, setKpis] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingKpi, setEditingKpi] = useState(null);

  // Form Fields
  const [name, setName] = useState('');
  const [target, setTarget] = useState('');
  const [actual, setActual] = useState('');
  const [unit, setUnit] = useState('$');
  const [thresholdWarning, setThresholdWarning] = useState('');
  const [thresholdCritical, setThresholdCritical] = useState('');
  const [description, setDescription] = useState('');

  const fetchKpis = async () => {
    try {
      const res = await api.get('/kpis');
      setKpis(res.data);
    } catch (err) {
      console.error('Error fetching KPIs:', err);
      setErrorMsg('Failed to load metric monitors.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKpis();
  }, []);

  const handleOpenCreateModal = () => {
    setEditingKpi(null);
    setName('');
    setTarget('');
    setActual('');
    setUnit('$');
    setThresholdWarning('');
    setThresholdCritical('');
    setDescription('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (kpi) => {
    setEditingKpi(kpi);
    setName(kpi.name);
    setTarget(kpi.target);
    setActual(kpi.actual);
    setUnit(kpi.unit);
    setThresholdWarning(kpi.threshold_warning || '');
    setThresholdCritical(kpi.threshold_critical || '');
    setDescription(kpi.description || '');
    setIsModalOpen(true);
  };

  const handleDeleteKpi = async (id) => {
    if (!window.confirm('Are you absolutely sure you want to delete this KPI tracker?')) return;
    try {
      await api.delete(`/kpis/${id}`);
      setKpis(kpis.filter(k => k.id !== id));
    } catch (err) {
      alert('Delete operation failed: ' + err.message);
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!name || target === '' || actual === '') return;

    const payload = {
      name,
      target: parseFloat(target),
      actual: parseFloat(actual),
      unit,
      thresholdWarning: thresholdWarning !== '' ? parseFloat(thresholdWarning) : null,
      thresholdCritical: thresholdCritical !== '' ? parseFloat(thresholdCritical) : null,
      description
    };

    try {
      if (editingKpi) {
        // Edit Mode
        const res = await api.put(`/kpis/${editingKpi.id}`, payload);
        setKpis(kpis.map(k => k.id === editingKpi.id ? res.data : k));
      } else {
        // Create Mode
        const res = await api.post('/kpis', payload);
        setKpis([...kpis, res.data]);
      }
      setIsModalOpen(false);
    } catch (err) {
      alert('Failed to save KPI tracker: ' + err.message);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-14 glass-panel rounded-2xl animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-56 glass-panel rounded-2xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-slide">
      {/* 1. Header controls */}
      <div className="flex justify-between items-center gap-4">
        <div>
          <h2 className="text-lg font-bold text-white tracking-tight">System KPI Metrics</h2>
          <p className="text-xs text-gray-400 mt-0.5">Define core business thresholds and monitor target achievements in real-time.</p>
        </div>

        {isAdmin && (
          <button
            onClick={handleOpenCreateModal}
            className="bg-brand-primary hover:bg-brand-primary/95 hover:shadow-glass-glow text-white text-xs font-bold py-3.5 px-5 rounded-xl flex items-center gap-2 transition-all shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Create KPI Monitor</span>
          </button>
        )}
      </div>

      {/* 2. Grid items */}
      {kpis.length === 0 ? (
        <div className="glass-panel rounded-2xl p-12 text-center max-w-lg mx-auto">
          <Target className="w-12 h-12 text-gray-500 mx-auto mb-4" />
          <h3 className="text-white font-bold mb-1">No Active KPIs Trackers</h3>
          <p className="text-xs text-gray-400 mb-6">You haven't defined any performance targets. Add MRR, CAC, or conversion tracks to monitor growth.</p>
          {isAdmin && (
            <button
              onClick={handleOpenCreateModal}
              className="bg-white/5 border border-white/10 hover:bg-white/10 text-white text-xs font-bold py-3 px-5 rounded-xl transition-all"
            >
              Set First KPI Target
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {kpis.map(kpi => (
            <div key={kpi.id}>
              <KPICard 
                kpi={kpi} 
                onEdit={handleOpenEditModal} 
                onDelete={handleDeleteKpi}
                isAdmin={isAdmin}
              />
            </div>
          ))}
        </div>
      )}

      {/* 3. Gorgeous Glassmorphic CRUD Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm animate-fade">
          <div className="w-full max-w-xl glass-panel rounded-3xl p-8 border border-white/10 shadow-glass relative max-h-[90vh] overflow-y-auto">
            {/* Top Close Button */}
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-6 right-6 p-2 rounded-xl bg-white/5 border border-white/5 text-gray-400 hover:text-white hover:bg-white/10 transition-all"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Modal Title */}
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-brand-primary/10 border border-brand-primary/20 p-2.5 rounded-xl">
                <Target className="w-5 h-5 text-brand-primary" />
              </div>
              <h3 className="text-lg font-bold text-white tracking-tight">
                {editingKpi ? 'Adjust KPI Target Parameters' : 'Create KPI Target Tracker'}
              </h3>
            </div>

            {/* Form */}
            <form onSubmit={handleFormSubmit} className="space-y-5">
              {/* Row 1: Name */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">KPI Tracker Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Monthly Recurring Revenue (MRR)"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-white/5 border border-white/5 focus:border-brand-primary/50 focus:bg-white/10 text-xs rounded-xl p-3.5 outline-none text-white transition-all"
                />
              </div>

              {/* Row 2: Target & Actual side-by-side */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Target Objective</label>
                  <input
                    type="number"
                    step="any"
                    required
                    placeholder="150000"
                    value={target}
                    onChange={(e) => setTarget(e.target.value)}
                    className="w-full bg-white/5 border border-white/5 focus:border-brand-primary/50 focus:bg-white/10 text-xs rounded-xl p-3.5 outline-none text-white transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Live Actual Value</label>
                  <input
                    type="number"
                    step="any"
                    required
                    placeholder="142500"
                    value={actual}
                    onChange={(e) => setActual(e.target.value)}
                    className="w-full bg-white/5 border border-white/5 focus:border-brand-primary/50 focus:bg-white/10 text-xs rounded-xl p-3.5 outline-none text-white transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Display Unit</label>
                  <select
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    className="w-full bg-white/5 border border-white/5 focus:border-brand-primary/50 focus:bg-white/10 text-xs rounded-xl p-3.5 outline-none text-white transition-all cursor-pointer"
                  >
                    <option value="$" className="bg-dark-bg text-white">USD ($)</option>
                    <option value="%" className="bg-dark-bg text-white">Percent (%)</option>
                    <option value="qty" className="bg-dark-bg text-white">Quantity (qty)</option>
                  </select>
                </div>
              </div>

              {/* Row 3: Thresholds */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1">
                    <span>Warning Threshold</span>
                    <HelpCircle className="w-3 h-3 text-gray-500" title="Triggers warning if actual drops below this target (e.g. below 90% of target)" />
                  </label>
                  <input
                    type="number"
                    step="any"
                    placeholder="135000"
                    value={thresholdWarning}
                    onChange={(e) => setThresholdWarning(e.target.value)}
                    className="w-full bg-white/5 border border-white/5 focus:border-brand-primary/50 focus:bg-white/10 text-xs rounded-xl p-3.5 outline-none text-white transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1">
                    <span>Critical Threshold</span>
                    <HelpCircle className="w-3 h-3 text-gray-500" title="Triggers critical alert if actual drops below this target (e.g. below 75% of target)" />
                  </label>
                  <input
                    type="number"
                    step="any"
                    placeholder="112500"
                    value={thresholdCritical}
                    onChange={(e) => setThresholdCritical(e.target.value)}
                    className="w-full bg-white/5 border border-white/5 focus:border-brand-primary/50 focus:bg-white/10 text-xs rounded-xl p-3.5 outline-none text-white transition-all"
                  />
                </div>
              </div>

              {/* Row 4: Description */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">KPI Description & Purpose</label>
                <textarea
                  rows="3"
                  placeholder="Provide context regarding how this metric is calculated and why it matters..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-white/5 border border-white/5 focus:border-brand-primary/50 focus:bg-white/10 text-xs rounded-xl p-3.5 outline-none text-white transition-all resize-none"
                />
              </div>

              {/* Submit Buttons */}
              <div className="flex gap-4 mt-6 pt-4 border-t border-dark-border">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 bg-white/5 border border-white/5 hover:bg-white/10 text-xs font-bold py-3.5 px-4 rounded-xl text-gray-400 hover:text-white transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-brand-primary hover:bg-brand-primary/95 text-white text-xs font-bold py-3.5 px-4 rounded-xl shadow-glass-glow hover:shadow-indigo-500/10 transition-all"
                >
                  {editingKpi ? 'Save Target Changes' : 'Establish KPI Tracker'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
