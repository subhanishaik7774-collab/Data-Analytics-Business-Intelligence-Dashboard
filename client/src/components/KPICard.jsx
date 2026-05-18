import React from 'react';
import { 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  TrendingUp, 
  TrendingDown, 
  Target
} from 'lucide-react';
import { formatCurrency, formatPercent, formatInteger } from '../utils/formatters';

export default function KPICard({ kpi, onEdit, onDelete, isAdmin }) {
  const { id, name, target, actual, unit, status, description } = kpi;

  // Format metric based on its unit type
  const formatVal = (val) => {
    if (unit === '$') return formatCurrency(val);
    if (unit === '%') return formatPercent(val);
    return formatInteger(val);
  };

  // Determine colors based on status
  const getStatusConfig = () => {
    switch (status) {
      case 'On Track':
        return {
          bg: 'bg-brand-accent/15 border-brand-accent/30 text-brand-accent',
          shadow: 'shadow-emerald-glow',
          barColor: 'bg-brand-accent',
          icon: CheckCircle2
        };
      case 'Warning':
        return {
          bg: 'bg-brand-warning/15 border-brand-warning/30 text-brand-warning',
          shadow: 'shadow-glass-glow',
          barColor: 'bg-brand-warning',
          icon: AlertTriangle
        };
      case 'Critical':
        return {
          bg: 'bg-brand-danger/15 border-brand-danger/30 text-brand-danger',
          shadow: 'shadow-rose-glow',
          barColor: 'bg-brand-danger',
          icon: XCircle
        };
      default:
        return {
          bg: 'bg-gray-500/15 border-gray-500/30 text-gray-400',
          shadow: 'shadow-none',
          barColor: 'bg-gray-500',
          icon: Target
        };
    }
  };

  const statusConfig = getStatusConfig();
  const StatusIcon = statusConfig.icon;

  // Calculate progress percentage (capping at 100% for bar render but keeping ratio for display)
  const isCac = name.toLowerCase().includes('cac') || name.toLowerCase().includes('cost');
  // For standard: higher is better. For costs/CAC: lower is better.
  let progressRatio = 0;
  if (target > 0) {
    if (isCac) {
      // If actual is below target, that's >100% efficiency
      progressRatio = (target / actual) * 100;
    } else {
      progressRatio = (actual / target) * 100;
    }
  }

  const displayProgress = parseFloat(progressRatio.toFixed(1));
  const renderedProgressPercent = Math.min(100, Math.max(0, displayProgress));

  return (
    <div className={`glass-panel glass-panel-hover rounded-2xl p-6 flex flex-col justify-between h-full relative overflow-hidden ${statusConfig.shadow}`}>
      {/* Absolute top glowing bar for premium effect */}
      <div className={`absolute top-0 left-0 w-full h-[3px] ${statusConfig.barColor}`} />

      <div>
        <div className="flex justify-between items-start mb-4">
          <span className="text-xs font-semibold tracking-wider text-gray-400 uppercase truncate pr-2" title={name}>
            {name}
          </span>
          <span className={`flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-full border ${statusConfig.bg}`}>
            <StatusIcon className="w-3 h-3" />
            {status}
          </span>
        </div>

        <div className="flex items-baseline gap-2 mb-2">
          <span className="text-2xl font-extrabold text-white tracking-tight">{formatVal(actual)}</span>
          <span className="text-xs text-gray-400">of {formatVal(target)} target</span>
        </div>

        {description && (
          <p className="text-xs text-gray-400 line-clamp-2 mb-5 leading-relaxed">
            {description}
          </p>
        )}
      </div>

      {/* Progress metrics */}
      <div className="mt-auto">
        <div className="flex justify-between items-center text-xs mb-1.5 font-medium">
          <span className="text-gray-400">Target Achievement</span>
          <span className={status === 'Critical' ? 'text-brand-danger' : status === 'Warning' ? 'text-brand-warning' : 'text-brand-accent'}>
            {displayProgress}%
          </span>
        </div>
        
        {/* Progress slide bar */}
        <div className="w-full h-2 rounded-full bg-white/5 border border-white/5 overflow-hidden">
          <div 
            className={`h-full rounded-full transition-all duration-500 ease-out ${statusConfig.barColor}`}
            style={{ width: `${renderedProgressPercent}%` }}
          />
        </div>

        {/* Administration Actions */}
        {isAdmin && (onEdit || onDelete) && (
          <div className="flex justify-end gap-3 mt-4 pt-3 border-t border-dark-border">
            <button
              onClick={() => onEdit(kpi)}
              className="text-xs font-semibold text-brand-primary hover:text-brand-primary/80 hover:underline transition-all"
            >
              Edit
            </button>
            <button
              onClick={() => onDelete(id)}
              className="text-xs font-semibold text-brand-danger hover:text-brand-danger/80 hover:underline transition-all"
            >
              Delete
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
