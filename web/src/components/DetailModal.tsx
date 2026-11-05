import React, { useMemo } from 'react';
import {
  X,
  Building2,
  Layers,
  FileText,
  User,
  Compass
} from 'lucide-react';
import type { AnalyticsRecord } from '../types';

export interface DrillDownItem {
  type: 'cost_center' | 'package';
  id: string; // code or package name
  title: string;
  orcado: number;
  realizado: number;
  desvio: number;
  desvio_pct: number;
  gestor?: string;
  email_gestor?: string;
  macroarea?: string;
  negocio?: string;
}

interface DetailModalProps {
  item: DrillDownItem | null;
  onClose: () => void;
  analyticsRecords: AnalyticsRecord[];
  scale: 'BRL' | 'BRL_1000';
  theme?: 'light' | 'dark';
}

export const DetailModal: React.FC<DetailModalProps> = ({
  item,
  onClose,
  analyticsRecords,
  scale,
  theme = 'light'
}) => {
  if (!item) return null;

  const isDark = theme === 'dark';
  const scaleDivisor = scale === 'BRL_1000' ? 1000 : 1;
  const scaleSuffix = scale === 'BRL_1000' ? ' mil' : '';

  const formatCurrency = (val: number) => {
    const scaled = val / scaleDivisor;
    return (
      new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
        maximumFractionDigits: scale === 'BRL_1000' ? 1 : 0
      }).format(scaled) + scaleSuffix
    );
  };

  // Filter analytics entries related to this item
  const relatedAnalytics = useMemo(() => {
    if (item.type === 'cost_center') {
      return analyticsRecords.filter((r) => r.centro_custo === item.id);
    } else {
      return analyticsRecords.filter((r) => r.pacote === item.id);
    }
  }, [item, analyticsRecords]);

  // Aggregate top accounts (contas contábeis)
  const topAccounts = useMemo(() => {
    const accountMap = new Map<string, { desc: string; total: number; orcado: number; realizado: number }>();

    relatedAnalytics.forEach((r) => {
      const existing = accountMap.get(r.conta) || {
        desc: r.desc_conta,
        total: 0,
        orcado: 0,
        realizado: 0
      };

      if (r.tipo === 'Orçado') existing.orcado += r.valor;
      if (r.tipo === 'Realizado') existing.realizado += r.valor;
      existing.total += r.valor;

      accountMap.set(r.conta, existing);
    });

    return Array.from(accountMap.entries())
      .map(([conta, data]) => ({
        conta,
        desc: data.desc,
        orcado: data.orcado,
        realizado: data.realizado,
        desvio: data.realizado - data.orcado
      }))
      .sort((a, b) => b.realizado - a.realizado)
      .slice(0, 8);
  }, [relatedAnalytics]);

  const isOver = item.desvio > 0;
  const atingimentoPct = item.orcado > 0 ? (item.realizado / item.orcado) * 100 : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div
        className={`w-full max-w-3xl max-h-[90vh] flex flex-col rounded-2xl shadow-2xl overflow-hidden border transition-all ${
          isDark
            ? 'bg-[#18222f] border-slate-700 text-slate-100'
            : 'bg-white border-slate-200 text-slate-800'
        }`}
      >
        {/* Header */}
        <div
          className={`px-6 py-4 border-b flex items-center justify-between ${
            isDark ? 'bg-[#141b25] border-slate-700' : 'bg-slate-50 border-slate-200'
          }`}
        >
          <div className="flex items-center space-x-3">
            <div
              className={`p-2.5 rounded-xl ${
                item.type === 'cost_center'
                  ? 'bg-blue-500/10 text-blue-500'
                  : 'bg-emerald-500/10 text-emerald-500'
              }`}
            >
              {item.type === 'cost_center' ? (
                <Building2 className="w-5 h-5" />
              ) : (
                <Layers className="w-5 h-5" />
              )}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-500/15 text-[#e84752]">
                  {item.id}
                </span>
                <span
                  className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                    item.type === 'cost_center'
                      ? 'bg-blue-500/20 text-blue-400'
                      : 'bg-emerald-500/20 text-emerald-400'
                  }`}
                >
                  {item.type === 'cost_center' ? 'Centro de Custo' : 'Pacote de Gastos'}
                </span>
              </div>
              <h3 className="text-base font-bold mt-0.5 truncate max-w-md">{item.title}</h3>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className={`p-2 rounded-lg transition-colors cursor-pointer ${
              isDark ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-slate-200 text-slate-500'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Metadata info strip */}
          {(item.gestor || item.macroarea || item.negocio) && (
            <div
              className={`p-3.5 rounded-xl border flex flex-wrap gap-4 text-xs ${
                isDark ? 'bg-slate-800/40 border-slate-700/80' : 'bg-slate-50 border-slate-200'
              }`}
            >
              {item.gestor && (
                <div className="flex items-center space-x-1.5">
                  <User className="w-4 h-4 text-slate-400" />
                  <span className="text-slate-400">Gestor:</span>
                  <span className="font-bold">{item.gestor}</span>
                </div>
              )}
              {item.macroarea && (
                <div className="flex items-center space-x-1.5">
                  <Compass className="w-4 h-4 text-slate-400" />
                  <span className="text-slate-400">Macroárea:</span>
                  <span className="font-bold">{item.macroarea}</span>
                </div>
              )}
              {item.negocio && (
                <div className="flex items-center space-x-1.5">
                  <Building2 className="w-4 h-4 text-slate-400" />
                  <span className="text-slate-400">Negócio:</span>
                  <span className="font-bold">{item.negocio}</span>
                </div>
              )}
            </div>
          )}

          {/* Key Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div
              className={`p-3.5 rounded-xl border ${
                isDark ? 'bg-slate-800/60 border-slate-700' : 'bg-slate-50 border-slate-200'
              }`}
            >
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Orçado
              </span>
              <div className="text-lg font-extrabold mt-1">{formatCurrency(item.orcado)}</div>
            </div>

            <div
              className={`p-3.5 rounded-xl border ${
                isDark ? 'bg-slate-800/60 border-slate-700' : 'bg-slate-50 border-slate-200'
              }`}
            >
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Realizado
              </span>
              <div className="text-lg font-extrabold mt-1">{formatCurrency(item.realizado)}</div>
            </div>

            <div
              className={`p-3.5 rounded-xl border ${
                isDark ? 'bg-slate-800/60 border-slate-700' : 'bg-slate-50 border-slate-200'
              }`}
            >
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Desvio Nominal
              </span>
              <div
                className={`text-lg font-extrabold mt-1 ${
                  isOver ? 'text-[#e84752]' : 'text-emerald-500'
                }`}
              >
                {isOver ? '+' : ''}
                {formatCurrency(item.desvio)}
              </div>
            </div>

            <div
              className={`p-3.5 rounded-xl border ${
                isDark ? 'bg-slate-800/60 border-slate-700' : 'bg-slate-50 border-slate-200'
              }`}
            >
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Atingimento
              </span>
              <div
                className={`text-lg font-extrabold mt-1 ${
                  atingimentoPct > 100 ? 'text-[#e84752]' : 'text-emerald-500'
                }`}
              >
                {atingimentoPct.toFixed(1)}%
              </div>
            </div>
          </div>

          {/* Top Accounts Breakdown */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <FileText className="w-4 h-4 text-[#385463]" />
                <h4 className="text-xs font-bold uppercase tracking-wider">
                  Principais Contas Contábeis (Ofensores de Gasto)
                </h4>
              </div>
              <span className="text-[11px] text-slate-400">
                {relatedAnalytics.length} lançamentos encontrados
              </span>
            </div>

            {topAccounts.length > 0 ? (
              <div
                className={`rounded-xl border overflow-hidden ${
                  isDark ? 'border-slate-700' : 'border-slate-200'
                }`}
              >
                <table className="w-full text-xs text-left">
                  <thead
                    className={`text-[10px] uppercase font-bold tracking-wider ${
                      isDark ? 'bg-slate-800/80 text-slate-400' : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    <tr>
                      <th className="py-2.5 px-3">Conta</th>
                      <th className="py-2.5 px-3">Descrição da Conta</th>
                      <th className="py-2.5 px-3 text-right">Realizado</th>
                      <th className="py-2.5 px-3 text-right">Orçado</th>
                      <th className="py-2.5 px-3 text-right">Desvio</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {topAccounts.map((acc) => {
                      const accOver = acc.desvio > 0;
                      return (
                        <tr
                          key={acc.conta}
                          className={
                            isDark ? 'hover:bg-slate-800/40' : 'hover:bg-slate-50'
                          }
                        >
                          <td className="py-2 px-3 font-mono font-bold text-slate-400">
                            {acc.conta}
                          </td>
                          <td className="py-2 px-3 font-medium truncate max-w-[220px]">
                            {acc.desc || '—'}
                          </td>
                          <td className="py-2 px-3 text-right font-bold">
                            {formatCurrency(acc.realizado)}
                          </td>
                          <td className="py-2 px-3 text-right text-slate-400">
                            {formatCurrency(acc.orcado)}
                          </td>
                          <td
                            className={`py-2 px-3 text-right font-extrabold ${
                              accOver ? 'text-[#e84752]' : 'text-emerald-500'
                            }`}
                          >
                            {accOver ? '+' : ''}
                            {formatCurrency(acc.desvio)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div
                className={`p-6 text-center text-xs rounded-xl border border-dashed ${
                  isDark
                    ? 'border-slate-700 text-slate-400'
                    : 'border-slate-200 text-slate-500'
                }`}
              >
                Nenhum detalhamento de contas disponível na amostra analítica para este item.
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div
          className={`px-6 py-3 border-t flex justify-between items-center text-xs ${
            isDark ? 'bg-[#141b25] border-slate-700 text-slate-400' : 'bg-slate-50 border-slate-200 text-slate-500'
          }`}
        >
          <span>Painel GGO Digital • Drill-down de Controladoria</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-[#24303b] hover:bg-[#1a232b] text-white font-bold cursor-pointer"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
