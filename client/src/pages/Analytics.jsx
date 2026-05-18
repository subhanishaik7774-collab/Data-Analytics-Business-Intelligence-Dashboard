import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { 
  BarChart3, 
  TrendingUp, 
  Calendar, 
  Tag, 
  Layers,
  Search,
  FilterX
} from 'lucide-react';
import { formatCurrency, formatPercent, formatInteger, formatDate } from '../utils/formatters';
import { SegmentBarChart, DualMetricsLineChart } from '../components/MetricCharts';

export default function Analytics() {
  const [rawData, setRawData] = useState(null);
  const [filteredData, setFilteredData] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Filter States
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedSegment, setSelectedSegment] = useState('All');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Dropdown lists
  const [categoriesList, setCategoriesList] = useState(['All']);
  const [segmentsList, setSegmentsList] = useState(['All']);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await api.get('/dashboard/analytics');
        setRawData(res.data);
        
        // Extract unique categories and segments dynamically
        const cats = ['All', ...new Set(res.data.categories.map(c => c.category))];
        const segs = ['All', ...new Set(res.data.segments.map(s => s.segment))];
        setCategoriesList(cats);
        setSegmentsList(segs);
        
        setFilteredData(res.data);
      } catch (err) {
        console.error('Error fetching analytics details:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  // Filter application trigger
  useEffect(() => {
    if (!rawData) return;

    let daily = [...rawData.daily];
    let segments = [...rawData.segments];
    let categories = [...rawData.categories];

    // Filter by start date
    if (startDate) {
      daily = daily.filter(d => new Date(d.date) >= new Date(startDate));
    }
    // Filter by end date
    if (endDate) {
      daily = daily.filter(d => new Date(d.date) <= new Date(endDate));
    }

    // Since daily trends represent total, we can approximate filters or use backend exports.
    // Client-side visual filtering provides a highly responsive UI experience.
    setFilteredData({
      summary: rawData.summary, // maintain summary overall
      daily,
      segments: selectedSegment === 'All' ? segments : segments.filter(s => s.segment === selectedSegment),
      categories: selectedCategory === 'All' ? categories : categories.filter(c => c.category === selectedCategory)
    });

  }, [selectedCategory, selectedSegment, startDate, endDate, rawData]);

  const handleResetFilters = () => {
    setSelectedCategory('All');
    setSelectedSegment('All');
    setStartDate('');
    setEndDate('');
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-20 glass-panel rounded-2xl animate-pulse" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-96 glass-panel rounded-2xl animate-pulse" />
          <div className="h-96 glass-panel rounded-2xl animate-pulse" />
        </div>
      </div>
    );
  }

  const isDataEmpty = !rawData || rawData.daily.length === 0;

  if (isDataEmpty) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
        <p className="text-gray-400">Please import a valid CSV file containing daily SaaS metrics first.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-slide">
      {/* 1. Filtration Control Panel */}
      <div className="glass-panel rounded-2xl p-5 shadow-glass flex flex-wrap gap-4 items-end">
        {/* Category Filter */}
        <div className="flex-1 min-w-[200px] space-y-1.5">
          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
            <Tag className="w-3 h-3 text-brand-primary" />
            <span>Product Category</span>
          </label>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full bg-white/5 border border-white/5 focus:border-brand-primary/50 text-xs rounded-xl p-3 outline-none text-white transition-all cursor-pointer"
          >
            {categoriesList.map(cat => (
              <option key={cat} value={cat} className="bg-dark-bg text-white">{cat}</option>
            ))}
          </select>
        </div>

        {/* Segment Filter */}
        <div className="flex-1 min-w-[200px] space-y-1.5">
          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
            <Layers className="w-3 h-3 text-brand-secondary" />
            <span>Client Segment</span>
          </label>
          <select
            value={selectedSegment}
            onChange={(e) => setSelectedSegment(e.target.value)}
            className="w-full bg-white/5 border border-white/5 focus:border-brand-primary/50 text-xs rounded-xl p-3 outline-none text-white transition-all cursor-pointer"
          >
            {segmentsList.map(seg => (
              <option key={seg} value={seg} className="bg-dark-bg text-white">{seg}</option>
            ))}
          </select>
        </div>

        {/* Dates Range */}
        <div className="flex-1 min-w-[300px] space-y-1.5">
          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
            <Calendar className="w-3 h-3 text-brand-accent" />
            <span>Date Range Horizon</span>
          </label>
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="flex-1 bg-white/5 border border-white/5 focus:border-brand-primary/50 text-xs rounded-xl p-3 outline-none text-white transition-all"
            />
            <span className="text-gray-500 text-xs font-bold">to</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="flex-1 bg-white/5 border border-white/5 focus:border-brand-primary/50 text-xs rounded-xl p-3 outline-none text-white transition-all"
            />
          </div>
        </div>

        {/* Filter Reset Button */}
        <button
          onClick={handleResetFilters}
          className="bg-white/5 border border-white/5 hover:bg-white/10 text-xs font-bold p-3 rounded-xl flex items-center gap-2 text-gray-400 hover:text-white transition-all shrink-0 h-[42px]"
        >
          <FilterX className="w-4 h-4" />
          <span>Clear Filters</span>
        </button>
      </div>

      {/* 2. Visualization Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Signups and Conversion Dual Axis Line Chart */}
        <div className="glass-panel rounded-2xl p-6 shadow-glass flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-white tracking-tight">Growth & Conversion Matrix</h3>
            <p className="text-xs text-gray-400 mt-0.5">Dual-axis view plotting user signups against percentage conversion.</p>
          </div>
          <div className="mt-6">
            <DualMetricsLineChart data={filteredData.daily} />
          </div>
        </div>

        {/* Customer Segment Bar Chart */}
        <div className="glass-panel rounded-2xl p-6 shadow-glass flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-white tracking-tight">Customer Segments Distribution</h3>
            <p className="text-xs text-gray-400 mt-0.5">Total billing revenue generated comparing Enterprise, SMB, and Consumers.</p>
          </div>
          <div className="mt-6">
            <SegmentBarChart data={filteredData.segments} />
          </div>
        </div>
      </div>

      {/* 3. Aggregated Grid Details */}
      <div className="glass-panel rounded-2xl p-6 shadow-glass">
        <h3 className="text-base font-bold text-white tracking-tight mb-4">Historical Metric Aggregations</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-dark-border text-gray-400 font-semibold">
                <th className="py-3 px-4">Period Date</th>
                <th className="py-3 px-4">Daily Sales Volume</th>
                <th className="py-3 px-4">Daily Revenue Generated</th>
                <th className="py-3 px-4">Signups Acquired</th>
                <th className="py-3 px-4">Avg. Conversion Rate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-border text-gray-300 font-medium">
              {filteredData.daily.slice(0, 10).map((row, idx) => (
                <tr key={idx} className="hover:bg-white/5 transition-all">
                  <td className="py-3.5 px-4 font-bold text-white">{formatDate(row.date)}</td>
                  <td className="py-3.5 px-4">{formatInteger(row.sales)}</td>
                  <td className="py-3.5 px-4 font-bold text-brand-primary">{formatCurrency(row.revenue)}</td>
                  <td className="py-3.5 px-4">{formatInteger(row.signups)}</td>
                  <td className="py-3.5 px-4 text-brand-warning">{formatPercent(row.conversionRate)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredData.daily.length > 10 && (
          <p className="text-[10px] text-gray-500 font-semibold text-center mt-4">
            Displaying top 10 rows. Export a CSV file from the Reports page to review the full dataset.
          </p>
        )}
      </div>
    </div>
  );
}
