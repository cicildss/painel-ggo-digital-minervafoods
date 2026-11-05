import React from 'react';
import { Info } from 'lucide-react';

interface ExecutiveGaugeProps {
  atingimentoPct: number;
  topOfensorName?: string;
  topOfensorVal?: string;
  centrosEstouroCount: number;
  totalCentros: number;
  isDark?: boolean;
}

export const ExecutiveGauge: React.FC<ExecutiveGaugeProps> = ({
  atingimentoPct,
  topOfensorName,
  topOfensorVal,
  centrosEstouroCount,
  totalCentros,
  isDark = false
}) => {
  const clampedPct = Math.min(150, Math.max(0, atingimentoPct));

  let statusColor = '#10b981'; // green
  let statusText = 'Meta Sob Controle';
  let statusDesc = 'Gastos realizados dentro do limite orçado corporativo.';
  if (atingimentoPct > 105) {
    statusColor = '#e84752'; // red
    statusText = 'Atenção Crítica';
    statusDesc = 'Estouro orçamentário relevante requer plano de ação imediato.';
  } else if (atingimentoPct > 100) {
    statusColor = '#f59e0b'; // amber
    statusText = 'Alerta de Desvio';
    statusDesc = 'Leve pressão de gastos operacionais acima da meta orçada.';
  }

  const pctEstouroCentros = totalCentros > 0 ? (centrosEstouroCount / totalCentros) * 100 : 0;

  return (
    <div
      className={`rounded-xl border p-5 shadow-xs flex flex-col justify-between transition-all ${
        isDark ? 'bg-[#18222f] border-slate-700/80' : 'bg-white border-slate-200/90'
      }`}
    >
      <div>
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center space-x-2">
            <div
              className="w-2.5 h-2.5 rounded-full animate-pulse"
              style={{ backgroundColor: statusColor }}
            />
            <h4
              className={`text-xs font-bold uppercase tracking-wider ${
                isDark ? 'text-slate-200' : 'text-slate-800'
              }`}
            >
              Termômetro de Atingimento Orçamentário
            </h4>
          </div>
          <span
            className="text-[10px] font-bold px-2 py-0.5 rounded-full"
            style={{
              backgroundColor: `${statusColor}20`,
              color: statusColor,
              border: `1px solid ${statusColor}40`
            }}
          >
            {statusText}
          </span>
        </div>

        {/* Semi-Circle Meter */}
        <div className="relative flex flex-col items-center justify-center pt-4 pb-2">
          <div className="relative w-44 h-22 overflow-hidden">
            {/* Background semi-ring */}
            <div
              className={`w-44 h-44 rounded-full border-[14px] border-slate-200 dark:border-slate-700 box-border`}
              style={{
                borderBottomColor: 'transparent',
                borderLeftColor: 'transparent'
              }}
            />

            {/* Colored arc representing percentage */}
            <svg className="absolute top-0 left-0 w-44 h-44 -rotate-90">
              <circle
                cx="88"
                cy="88"
                r="74"
                fill="transparent"
                stroke={statusColor}
                strokeWidth="14"
                strokeDasharray="465"
                strokeDashoffset={465 - (465 * Math.min(100, clampedPct / 1.5)) / 100}
                strokeLinecap="round"
                className="transition-all duration-700 ease-out"
              />
            </svg>
          </div>

          {/* Central value */}
          <div className="text-center mt-1">
            <span
              className="text-2xl font-black tracking-tight"
              style={{ color: statusColor }}
            >
              {atingimentoPct.toFixed(1)}%
            </span>
            <span
              className={`text-[11px] block font-medium ${
                isDark ? 'text-slate-400' : 'text-slate-500'
              }`}
            >
              do Orçamento Consolidado
            </span>
          </div>
        </div>
      </div>

      {/* Smart Controller Insights */}
      <div
        className={`mt-3 p-3 rounded-xl border text-xs space-y-1.5 ${
          isDark
            ? 'bg-slate-800/40 border-slate-700/80 text-slate-300'
            : 'bg-slate-50 border-slate-200 text-slate-600'
        }`}
      >
        <div className="flex items-start space-x-2">
          <Info className="w-4 h-4 text-[#385463] shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <strong className="text-slate-900 dark:text-white">Diagnóstico: </strong>
            {statusDesc}
          </p>
        </div>

        {topOfensorName && (
          <div className="text-[11px] pt-1 border-t border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between">
            <span className="text-slate-400 truncate max-w-[170px]">
              Principal ofensor: <strong className="text-slate-700 dark:text-slate-200">{topOfensorName}</strong>
            </span>
            {topOfensorVal && (
              <span className="font-extrabold text-[#e84752]">{topOfensorVal}</span>
            )}
          </div>
        )}

        <div className="text-[10px] text-slate-400 flex items-center justify-between pt-0.5">
          <span>Centros em estouro:</span>
          <span className="font-bold text-slate-700 dark:text-slate-200">
            {centrosEstouroCount} de {totalCentros} ({pctEstouroCentros.toFixed(0)}%)
          </span>
        </div>
      </div>
    </div>
  );
};
