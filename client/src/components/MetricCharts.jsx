import React from 'react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { formatCompact, formatDate } from '../utils/formatters';

// Dark-themed custom glassmorphic tooltip component
const CustomTooltip = ({ active, payload, label, unit = '$' }) => {
  if (active && payload && payload.length) {
    return (
      <div className="glass-panel border border-white/10 rounded-xl p-3 shadow-glass shadow-indigo-500/5 animate-fade">
        <p className="text-xs font-semibold text-gray-400 mb-1.5">{formatDate(label)}</p>
        {payload.map((item, idx) => (
          <div key={idx} className="flex items-center gap-2 mt-1">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color || item.fill }} />
            <span className="text-xs text-gray-300 font-medium capitalize">{item.name}:</span>
            <span className="text-xs font-bold text-white">
              {item.unit === '$' || unit === '$' ? formatCompact(item.value, '$') : formatCompact(item.value, item.unit || '')}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

// 1. Dynamic Area Chart (Revenue Trends)
export function DynamicAreaChart({ data }) {
  return (
    <div className="w-full h-80">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#6366F1" stopOpacity={0.4}/>
              <stop offset="95%" stopColor="#6366F1" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255, 255, 255, 0.05)" />
          <XAxis 
            dataKey="date" 
            tickFormatter={(tick) => {
              const d = new Date(tick);
              return `${d.getUTCDate()}/${d.getUTCMonth() + 1}`;
            }}
            tick={{ fill: '#9CA3AF', fontSize: 10, fontWeight: 500 }}
            axisLine={{ stroke: 'rgba(255, 255, 255, 0.08)' }}
            tickLine={false}
          />
          <YAxis 
            tickFormatter={(tick) => formatCompact(tick, '$')}
            tick={{ fill: '#9CA3AF', fontSize: 10, fontWeight: 500 }}
            axisLine={{ stroke: 'rgba(255, 255, 255, 0.08)' }}
            tickLine={false}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area 
            type="monotone" 
            dataKey="revenue" 
            name="Revenue"
            stroke="#6366F1" 
            strokeWidth={2.5}
            fillOpacity={1} 
            fill="url(#colorRevenue)" 
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

// 2. Segment Bar Chart (Revenue by Segment)
export function SegmentBarChart({ data }) {
  return (
    <div className="w-full h-80">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255, 255, 255, 0.05)" />
          <XAxis 
            dataKey="segment" 
            tick={{ fill: '#9CA3AF', fontSize: 10, fontWeight: 500 }}
            axisLine={{ stroke: 'rgba(255, 255, 255, 0.08)' }}
            tickLine={false}
          />
          <YAxis 
            tickFormatter={(tick) => formatCompact(tick, '$')}
            tick={{ fill: '#9CA3AF', fontSize: 10, fontWeight: 500 }}
            axisLine={{ stroke: 'rgba(255, 255, 255, 0.08)' }}
            tickLine={false}
          />
          <Tooltip 
            cursor={{ fill: 'rgba(255, 255, 255, 0.02)' }}
            content={<CustomTooltip label="segment" />}
          />
          <Bar 
            dataKey="revenue" 
            name="Revenue"
            fill="#3B82F6" 
            radius={[6, 6, 0, 0]}
            maxBarSize={45}
          >
            {data.map((entry, index) => {
              const colors = ['#6366F1', '#3B82F6', '#10B981'];
              return <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />;
            })}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

// 3. Category Pie Chart (Product Distribution)
export function CategoryPieChart({ data }) {
  const COLORS = ['#6366F1', '#10B981', '#F59E0B', '#3B82F6', '#EC4899'];

  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index }) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return percent > 0.05 ? (
      <text x={x} y={y} fill="#white" textAnchor="middle" dominantBaseline="central" className="text-[10px] font-bold">
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    ) : null;
  };

  return (
    <div className="w-full h-80 flex flex-col items-center justify-center">
      <div className="w-full h-[85%]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={renderCustomizedLabel}
              innerRadius={50}
              outerRadius={80}
              paddingAngle={4}
              dataKey="revenue"
              nameKey="category"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip 
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const item = payload[0];
                  return (
                    <div className="glass-panel border border-white/10 rounded-xl p-3 shadow-glass animate-fade">
                      <span className="text-xs font-semibold text-gray-400 block mb-1">{item.name}</span>
                      <span className="text-sm font-bold text-white">{formatCompact(item.value, '$')}</span>
                    </div>
                  );
                }
                return null;
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      
      {/* Dynamic Grid Legend */}
      <div className="flex flex-wrap justify-center gap-4 px-4 w-full">
        {data.map((entry, index) => (
          <div key={entry.category} className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
            <span className="text-[11px] font-semibold text-gray-400 whitespace-nowrap">{entry.category}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// 4. Double Line Chart (Signups & Conversion Rate Trends)
export function DualMetricsLineChart({ data }) {
  return (
    <div className="w-full h-80">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 10, right: -10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255, 255, 255, 0.05)" />
          <XAxis 
            dataKey="date" 
            tickFormatter={(tick) => {
              const d = new Date(tick);
              return `${d.getUTCDate()}/${d.getUTCMonth() + 1}`;
            }}
            tick={{ fill: '#9CA3AF', fontSize: 10, fontWeight: 500 }}
            axisLine={{ stroke: 'rgba(255, 255, 255, 0.08)' }}
            tickLine={false}
          />
          <YAxis 
            yAxisId="left"
            tickFormatter={(tick) => formatCompact(tick, 'qty')}
            tick={{ fill: '#9CA3AF', fontSize: 10, fontWeight: 500 }}
            axisLine={{ stroke: 'rgba(255, 255, 255, 0.08)' }}
            tickLine={false}
          />
          <YAxis 
            yAxisId="right"
            orientation="right"
            tickFormatter={(tick) => `${tick}%`}
            tick={{ fill: '#9CA3AF', fontSize: 10, fontWeight: 500 }}
            axisLine={{ stroke: 'rgba(255, 255, 255, 0.08)' }}
            tickLine={false}
          />
          <Tooltip 
            content={<CustomTooltip unit="qty" />}
          />
          <Legend 
            verticalAlign="top" 
            height={36} 
            content={({ payload }) => (
              <div className="flex justify-center gap-6 text-xs font-semibold text-gray-400">
                {payload.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <div className="w-3 h-1 rounded" style={{ backgroundColor: item.color }} />
                    <span className="capitalize">{item.value}</span>
                  </div>
                ))}
              </div>
            )}
          />
          <Line 
            yAxisId="left"
            type="monotone" 
            dataKey="signups" 
            name="Signups" 
            stroke="#10B981" 
            strokeWidth={2.5}
            activeDot={{ r: 6 }}
            dot={false}
          />
          <Line 
            yAxisId="right"
            type="monotone" 
            dataKey="conversionRate" 
            name="Conv. Rate" 
            stroke="#F59E0B" 
            strokeWidth={2.5}
            activeDot={{ r: 6 }}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
