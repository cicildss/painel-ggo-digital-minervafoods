import React from 'react';
import type { LucideIcon } from 'lucide-react';
import { ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string;
  subValue?: string;
  icon: LucideIcon;
  badge?: {
    text: string;
    variant: 'positive' | 'negative' | 'neutral';
  };
  highlightColor?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subValue,
  icon: Icon,
  badge,
  highlightColor
}) => {
  return (
    <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs hover:shadow-sm transition-all relative overflow-hidden">
      {highlightColor && (
        <div
          className="absolute top-0 left-0 right-0 h-1"
          style={{ backgroundColor: highlightColor }}
        />
      )}
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{title}</p>
          <h3 className="text-2xl font-bold tracking-tight text-slate-900">{value}</h3>
          {subValue && <p className="text-xs text-slate-500 font-medium">{subValue}</p>}
        </div>
        <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 text-[#385463]">
          <Icon className="w-5 h-5" />
        </div>
      </div>

      {badge && (
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
          <span className="text-xs text-slate-500">Status vs Orçado:</span>
          <span
            className={`inline-flex items-center text-xs font-semibold px-2 py-0.5 rounded-full ${
              badge.variant === 'positive'
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                : badge.variant === 'negative'
                ? 'bg-rose-50 text-rose-700 border border-rose-200'
                : 'bg-slate-100 text-slate-700 border border-slate-200'
            }`}
          >
            {badge.variant === 'positive' && <ArrowDownRight className="w-3.5 h-3.5 mr-0.5" />}
            {badge.variant === 'negative' && <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" />}
            {badge.variant === 'neutral' && <Minus className="w-3.5 h-3.5 mr-0.5" />}
            {badge.text}
          </span>
        </div>
      )}
    </div>
  );
};
