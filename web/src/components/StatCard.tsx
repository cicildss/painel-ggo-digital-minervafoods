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
  theme?: 'light' | 'dark';
  tooltip?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subValue,
  icon: Icon,
  badge,
  accentColor = '#385463',
  theme = 'light',
  tooltip
}) => {
  const isDark = theme === 'dark';

  return (
    <div
      title={tooltip}
      className={`rounded-xl border shadow-xs hover:shadow-md transition-all duration-300 relative overflow-hidden group cursor-default ${
        isDark
          ? 'bg-[#18222f] border-slate-700/80 text-slate-100'
          : 'bg-white border-slate-200/90 text-slate-900'
      }`}
    >
      {/* Left accent bar */}
      <div
        className="absolute top-0 left-0 bottom-0 w-1.5 group-hover:w-2 transition-all duration-300"
        style={{ backgroundColor: accentColor }}
      />

      {/* Subtle background glow on hover */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{
          background: `radial-gradient(ellipse at 90% 10%, ${accentColor}12 0%, transparent 70%)`
        }}
      />

      <div className="p-5 pl-6 relative z-10">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <span
              className={`text-[11px] font-bold uppercase tracking-wider block ${
                isDark ? 'text-slate-400' : 'text-slate-400'
              }`}
            >
              {title}
            </span>
            <h3 className="text-2xl font-extrabold tracking-tight mt-1 leading-none">{value}</h3>
            {subValue && (
              <p
                className={`text-xs font-medium mt-1.5 leading-snug ${
                  isDark ? 'text-slate-400' : 'text-slate-500'
                }`}
              >
                {subValue}
              </p>
            )}
          </div>
          <div className="flex flex-col items-end space-y-2 shrink-0 ml-3">
            <div
              className="p-2.5 rounded-xl transition-all group-hover:scale-110 duration-300"
              style={{ backgroundColor: `${accentColor}18`, color: accentColor }}
            >
              <Icon className="w-5 h-5" />
            </div>
            {/* Micro sparkline bars */}
            <div className="flex items-end space-x-0.5 h-4 opacity-40 group-hover:opacity-75 transition-opacity">
              {[0.35, 0.55, 0.8, 0.5, 0.95].map((h, i) => (
                <div
                  key={i}
                  className="w-1 rounded-full transition-all duration-300"
                  style={{
                    height: `${h * 100}%`,
                    backgroundColor: accentColor
                  }}
                />
              ))}
            </div>
          </div>
        </div>

        {badge && (
          <div
            className={`mt-4 pt-3 border-t flex items-center justify-between ${
              isDark ? 'border-slate-800' : 'border-slate-100'
            }`}
          >
            <span className="text-[11px] text-slate-400 font-medium">Desempenho</span>
            <span
              className={`inline-flex items-center text-[11px] font-bold px-2 py-0.5 rounded-md ${
                badge.variant === 'positive'
                  ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                  : badge.variant === 'negative'
                  ? 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30'
                  : 'bg-slate-500/15 text-slate-600 dark:text-slate-300 border border-slate-500/30'
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
