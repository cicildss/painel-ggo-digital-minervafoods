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
  accentColor?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subValue,
  icon: Icon,
  badge,
  accentColor = '#385463'
}) => {
  return (
    <div className="bg-white rounded-xl border border-slate-200/90 shadow-xs hover:shadow-md transition-all duration-300 relative overflow-hidden group">
      {/* Left accent bar */}
      <div
        className="absolute top-0 left-0 bottom-0 w-1.5 group-hover:w-2 transition-all duration-300"
        style={{ backgroundColor: accentColor }}
      />

      <div className="p-5 pl-6">
        <div className="flex items-start justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              {title}
            </span>
            <h3 className="text-2xl font-extrabold tracking-tight text-slate-900 mt-1">
              {value}
            </h3>
            {subValue && (
              <p className="text-xs text-slate-500 font-medium mt-1 leading-snug">
                {subValue}
              </p>
            )}
          </div>
          <div
            className="p-2.5 rounded-xl transition-all shrink-0"
            style={{ backgroundColor: `${accentColor}18`, color: accentColor }}
          >
            <Icon className="w-5 h-5" />
          </div>
        </div>

        {badge && (
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
            <span className="text-[11px] text-slate-400 font-medium">Desempenho</span>
            <span
              className={`inline-flex items-center text-[11px] font-bold px-2 py-0.5 rounded-md ${
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
    </div>
  );
};
