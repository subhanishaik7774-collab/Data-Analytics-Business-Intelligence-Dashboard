import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { 
  FileSpreadsheet, 
  Download, 
  Calendar, 
  Tag, 
  Layers,
  FileJson,
  FileCheck,
  Eye
} from 'lucide-react';
import { formatCurrency, formatPercent, formatInteger, formatDate } from '../utils/formatters';

export default function Reports() {
  const [categories, setCategories] = useState(['All']);
  const [segments, setSegments] = useState(['All']);
  
  // Filter States
  const [category, setCategory] = useState('All');
  const [segment, setSegment] = useState('All');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [format, setFormat] = useState('csv');

  const [previewData, setPreviewData] = useState([]);
  const [loadingPreview, setLoadingPreview] = useState(true);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    const fetchFilterOptions = async () => {
      try {
        const res = await api.get('/dashboard/analytics');
        const cats = ['All', ...new Set(res.data.categories.map(c => c.category))];
        const segs = ['All', ...new Set(res.data.segments.map(s => s.segment))];
        setCategories(cats);
        setSegments(segs);
      } catch (err) {
        console.error('Error fetching filter categories:', err);
      }
    };
    fetchFilterOptions();
  }, []);

  // Update preview table whenever filters change
  useEffect(() => {
    const fetchPreview = async () => {
      setLoadingPreview(true);
      try {
        // Fetch raw JSON preview to display in preview panel
        const res = await api.get('/reports/export', {
          params: { startDate, endDate, category, segment, format: 'json' }
        });
        // Display top 5 rows as a preview
        setPreviewData(res.data);
      } catch (err) {
        console.error('Error fetching report preview:', err);
      } finally {
        setLoadingPreview(false);
      }
    };

    fetchPreview();
  }, [category, segment, startDate, endDate]);

  const handleExportSubmit = async (e) => {
    e.preventDefault();
    setExporting(true);

    try {
      // Trigger file download using blob streaming
      const res = await api.get('/reports/export', {
        params: { startDate, endDate, category, segment, format },
        responseType: 'blob'
      });

      // Create browser-level download links
      const blob = new Blob([res.data], { 
        type: format === 'csv' ? 'text/csv' : 'application/json' 
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `bi_insight_report_${new Date().toISOString().split('T')[0]}.${format}`);
      document.body.appendChild(link);
      link.click();
      
      // Cleanup browser cache
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);

    } catch (err) {
      alert('Failed to generate export file: ' + err.message);
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="space-y-8 animate-slide">
      <div>
        <h2 className="text-lg font-bold text-white tracking-tight">Structured Data Reports</h2>
        <p className="text-xs text-gray-400 mt-0.5">Filter, preview, and download custom analytics segments in CSV and JSON formats.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 1 Column: Filtration controls card */}
        <div className="glass-panel rounded-2xl p-6 shadow-glass h-fit space-y-6">
          <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
            <FileSpreadsheet className="w-4 h-4 text-brand-primary" />
            <span>Report Configuration</span>
          </h3>

          <form onSubmit={handleExportSubmit} className="space-y-4">
            {/* Start Date */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-brand-accent" />
                <span>Start Date</span>
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full bg-white/5 border border-white/5 focus:border-brand-primary/50 text-xs rounded-xl p-3 outline-none text-white transition-all"
              />
            </div>

            {/* End Date */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-brand-accent" />
                <span>End Date</span>
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full bg-white/5 border border-white/5 focus:border-brand-primary/50 text-xs rounded-xl p-3 outline-none text-white transition-all"
              />
            </div>

            {/* Category */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-brand-primary" />
                <span>Category Division</span>
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-white/5 border border-white/5 focus:border-brand-primary/50 text-xs rounded-xl p-3 outline-none text-white transition-all cursor-pointer"
              >
                {categories.map(cat => (
                  <option key={cat} value={cat} className="bg-dark-bg text-white">{cat}</option>
                ))}
              </select>
            </div>

            {/* Segment */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-brand-secondary" />
                <span>Client Segment</span>
              </label>
              <select
                value={segment}
                onChange={(e) => setSegment(e.target.value)}
                className="w-full bg-white/5 border border-white/5 focus:border-brand-primary/50 text-xs rounded-xl p-3 outline-none text-white transition-all cursor-pointer"
              >
                {segments.map(seg => (
                  <option key={seg} value={seg} className="bg-dark-bg text-white">{seg}</option>
                ))}
              </select>
            </div>

            {/* Export Format selection */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Export File Format</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setFormat('csv')}
                  className={`py-3 rounded-xl text-xs font-bold border flex items-center justify-center gap-2 transition-all ${
                    format === 'csv'
                      ? 'bg-brand-primary/10 border-brand-primary text-white'
                      : 'bg-white/5 border-transparent text-gray-400 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <FileSpreadsheet className="w-4 h-4 shrink-0" />
                  <span>CSV File</span>
                </button>
                <button
                  type="button"
                  onClick={() => setFormat('json')}
                  className={`py-3 rounded-xl text-xs font-bold border flex items-center justify-center gap-2 transition-all ${
                    format === 'json'
                      ? 'bg-brand-primary/10 border-brand-primary text-white'
                      : 'bg-white/5 border-transparent text-gray-400 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <FileJson className="w-4 h-4 shrink-0" />
                  <span>JSON File</span>
                </button>
              </div>
            </div>

            {/* Export Trigger button */}
            <button
              type="submit"
              disabled={exporting || previewData.length === 0}
              className="w-full bg-brand-primary hover:bg-brand-primary/95 hover:shadow-glass-glow text-white text-xs font-bold py-3.5 px-4 rounded-xl flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed pt-4"
            >
              <Download className="w-4 h-4" />
              <span>{exporting ? 'Generating Stream...' : 'Download Export Report'}</span>
            </button>
          </form>
        </div>

        {/* Right 2 Columns: Live Preview list */}
        <div className="lg:col-span-2 glass-panel rounded-2xl p-6 shadow-glass flex flex-col justify-between min-h-[450px]">
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
                <Eye className="w-4 h-4 text-brand-secondary" />
                <span>Export Preview Panel</span>
              </h3>
              <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-brand-primary/10 border border-brand-primary/25 text-brand-primary uppercase">
                {previewData.length} records matching
              </span>
            </div>
            
            <p className="text-xs text-gray-400 mb-6 leading-relaxed">
              Review raw columns matching your active filters. The download will contain the exact rows showcased below.
            </p>

            {loadingPreview ? (
              <div className="h-48 flex items-center justify-center text-xs text-gray-500 font-semibold">
                Parsing live preview grid...
              </div>
            ) : previewData.length === 0 ? (
              <div className="h-48 flex flex-col items-center justify-center text-center">
                <FileCheck className="w-8 h-8 text-gray-500 mb-2" />
                <span className="text-xs font-bold text-gray-400">Zero records found</span>
                <span className="text-[10px] text-gray-500 mt-1">Adjust start/end calendar dates or verify category divisions.</span>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-dark-border text-gray-400 font-semibold">
                      <th className="py-2.5 px-3">Date</th>
                      <th className="py-2.5 px-3">Category</th>
                      <th className="py-2.5 px-3">Segment</th>
                      <th className="py-2.5 px-3">Revenue</th>
                      <th className="py-2.5 px-3">Sales</th>
                      <th className="py-2.5 px-3">Signups</th>
                      <th className="py-2.5 px-3">Conv. Rate</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-dark-border text-gray-300 font-medium">
                    {previewData.slice(0, 7).map((row, idx) => (
                      <tr key={idx} className="hover:bg-white/5 transition-all">
                        <td className="py-2.5 px-3">{formatDate(row.date)}</td>
                        <td className="py-2.5 px-3">{row.category}</td>
                        <td className="py-2.5 px-3">{row.segment}</td>
                        <td className="py-2.5 px-3 font-bold text-brand-primary">{formatCurrency(row.revenue)}</td>
                        <td className="py-2.5 px-3">{formatInteger(row.sales)}</td>
                        <td className="py-2.5 px-3">{formatInteger(row.signups)}</td>
                        <td className="py-2.5 px-3 text-brand-warning">{formatPercent(row.conversion_rate)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
          
          {previewData.length > 7 && (
            <p className="text-[10px] text-gray-500 font-semibold text-center mt-4">
              Previewing first 7 rows. Full export file will pack all {previewData.length} records.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
