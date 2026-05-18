import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { 
  DollarSign, 
  ShoppingCart, 
  UserPlus, 
  Percent, 
  TrendingUp, 
  ArrowUpRight, 
  UploadCloud, 
  Target,
  FileSpreadsheet
} from 'lucide-react';
import { formatCurrency, formatPercent, formatInteger } from '../utils/formatters';
import { DynamicAreaChart, CategoryPieChart } from '../components/MetricCharts';
import KPICard from '../components/KPICard';

export default function Dashboard() {
  const [analytics, setAnalytics] = useState(null);
  const [kpis, setKpis] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [analyticsRes, kpisRes] = await Promise.all([
          api.get('/dashboard/analytics'),
          api.get('/kpis')
        ]);
        setAnalytics(analyticsRes.data);
        // Take top 3 KPIs for mini list
        setKpis(kpisRes.data.slice(0, 3));
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to pull system statistics. Refresh page or import datasets.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        {/* Skeleton grid loaders */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 glass-panel rounded-2xl animate-pulse" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-96 glass-panel rounded-2xl animate-pulse" />
          <div className="h-96 glass-panel rounded-2xl animate-pulse" />
        </div>
      </div>
    );
  }

  // Handle completely empty database state elegantly
  const isDataEmpty = !analytics || analytics.daily.length === 0;

  if (isDataEmpty) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] text-center p-6 animate-slide">
        <div className="bg-brand-primary/10 border border-brand-primary/20 p-6 rounded-3xl mb-6 shadow-glass-glow">
          <UploadCloud className="w-12 h-12 text-brand-primary animate-bounce-subtle" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">No Active Datasets Found</h2>
        <p className="text-sm text-gray-400 max-w-md mb-8 leading-relaxed">
          Get started by uploading a CSV, Excel, or JSON spreadsheet. We will parse the rows and instantly build your interactive analytics charts.
        </p>
        <div className="flex gap-4">
          <Link 
            to="/import" 
            className="bg-brand-primary hover:bg-brand-primary/90 text-white font-bold py-3.5 px-6 rounded-xl text-sm flex items-center gap-2 shadow-glass-glow transition-all"
          >
            <span>Import First Dataset</span>
            <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  const { summary, daily, categories } = analytics;

  const cardStats = [
    { name: 'Total Revenue', value: formatCurrency(summary.totalRevenue), icon: DollarSign, color: 'text-brand-primary', bg: 'bg-brand-primary/10 border-brand-primary/20' },
    { name: 'Total Sales Count', value: formatInteger(summary.totalSales), icon: ShoppingCart, color: 'text-brand-secondary', bg: 'bg-brand-secondary/10 border-brand-secondary/20' },
    { name: 'Total Signups', value: formatInteger(summary.totalSignups), icon: UserPlus, color: 'text-brand-accent', bg: 'bg-brand-accent/10 border-brand-accent/20' },
    { name: 'Avg. Conversion Rate', value: formatPercent(summary.avgConversionRate), icon: Percent, color: 'text-brand-warning', bg: 'bg-brand-warning/10 border-brand-warning/20' },
  ];

  return (
    <div className="space-y-8 animate-slide">
      {/* 1. Summary Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cardStats.map((stat, i) => (
          <div key={i} className="glass-panel glass-panel-hover rounded-2xl p-6 flex items-center justify-between shadow-glass relative overflow-hidden group">
            <div className="space-y-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-gray-400 block">{stat.name}</span>
              <span className="text-2xl font-extrabold text-white tracking-tight">{stat.value}</span>
            </div>
            <div className={`p-4 rounded-xl border flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-110 ${stat.bg}`}>
              <stat.icon className={`w-5 h-5 ${stat.color}`} />
            </div>
          </div>
        ))}
      </div>

      {/* 2. Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Revenue Trend Area Chart */}
        <div className="lg:col-span-2 glass-panel rounded-2xl p-6 shadow-glass relative flex flex-col justify-between">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">Revenue Progression</h3>
              <p className="text-xs text-gray-400 mt-0.5">Timeline overview of daily generated sales billing.</p>
            </div>
            <Link 
              to="/analytics" 
              className="text-xs font-semibold text-brand-primary flex items-center gap-1 hover:underline transition-all"
            >
              <span>Detailed Breakdown</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          
          <DynamicAreaChart data={daily} />
        </div>

        {/* Right Column: Category Pie Chart */}
        <div className="glass-panel rounded-2xl p-6 shadow-glass flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-white tracking-tight">Product Divisions</h3>
            <p className="text-xs text-gray-400 mt-0.5">Revenue distribution across categories.</p>
          </div>

          <CategoryPieChart data={categories} />
        </div>
      </div>

      {/* 3. Bottom Row: KPI monitoring snapshot */}
      {kpis.length > 0 && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-bold text-white tracking-tight">Active Core Metrics</h3>
              <p className="text-xs text-gray-400 mt-0.5">Quick tracking panel comparing targets with live actual values.</p>
            </div>
            <Link 
              to="/kpis" 
              className="text-xs font-semibold text-brand-primary flex items-center gap-1 hover:underline transition-all"
            >
              <span>Manage KPIs</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {kpis.map(kpi => (
              <div key={kpi.id} className="h-full">
                <KPICard kpi={kpi} isAdmin={false} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
