import React, { useMemo } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';
import { Layers, Users, Briefcase, BarChart3, MousePointerClick, FileSpreadsheet } from 'lucide-react';
import * as XLSX from 'xlsx';
import type { PackageRecord } from '../types';
import type { DrillDownItem } from './DetailModal';

interface PackagesViewProps {
  packages: PackageRecord[];
  scale: 'BRL' | 'BRL_1000';
  theme?: 'light' | 'dark';
  onSelectDrillDown?: (item: DrillDownItem) => void;
}

export const PackagesView: React.FC<PackagesViewProps> = ({
  packages,
  scale,
  theme = 'light',
  onSelectDrillDown
}) => {
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

  // Aggregates
  const totalRealizado = packages.reduce((acc, p) => acc + p.realizado, 0);

  const folhaPackages = packages.filter((p) => p.type === 'Folha');
  const folhaRealizado = folhaPackages.reduce((acc, p) => acc + p.realizado, 0);

  const operPackages = packages.filter((p) => p.type === 'Não Folha');
  const operRealizado = operPackages.reduce((acc, p) => acc + p.realizado, 0);

  // Sorted chart data
  const chartData = useMemo(() => {
    return [...packages]
      .sort((a, b) => b.realizado - a.realizado)
      .map((p) => ({
        name: p.package,
        Orçado: Math.round(p.orcado / scaleDivisor),
        Realizado: Math.round(p.realizado / scaleDivisor),
        type: p.type
      }));
  }, [packages, scaleDivisor]);

  const handlePackageClick = (pkg: PackageRecord) => {
    if (onSelectDrillDown) {
      onSelectDrillDown({
        type: 'package',
        id: pkg.package,
        title: pkg.package,
        orcado: pkg.orcado,
        realizado: pkg.realizado,
        desvio: pkg.desvio,
        desvio_pct: pkg.desvio_pct
      });
    }
  };

  const exportToExcel = () => {
    const exportData = packages.map((p) => ({
      'Pacote de Gastos': p.package,
      'Classificação': p.type,
      'Orçado (R$)': p.orcado,
      'Realizado (R$)': p.realizado,
      'Desvio Nominal (R$)': p.desvio,
      'Variação (%)': Number(p.desvio_pct.toFixed(2)),
      'Status': p.desvio > 0 ? 'Acima do Orçado' : 'Dentro/Economia'
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Pacotes_de_Gastos');
    XLSX.writeFile(wb, `GGO_Minerva_Pacotes_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 stagger-children">
        <div
          className={`rounded-xl border p-5 shadow-xs flex items-center justify-between transition-all ${
            isDark ? 'bg-[#18222f] border-slate-700/80 text-white' : 'bg-white border-slate-200/90'
          }`}
        >
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Total de Pacotes
            </span>
            <h3 className="text-2xl font-extrabold mt-1">{formatCurrency(totalRealizado)}</h3>
            <p className="text-xs text-slate-400 font-medium mt-0.5">
              {packages.length} pacotes orçamentários monitorados
            </p>
          </div>
          <div className="p-3 rounded-xl bg-blue-500/10 text-blue-500">
            <Layers className="w-5 h-5" />
          </div>
        </div>

        <div
          className={`rounded-xl border p-5 shadow-xs flex items-center justify-between transition-all ${
            isDark ? 'bg-[#18222f] border-slate-700/80 text-white' : 'bg-white border-slate-200/90'
          }`}
        >
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Folha & Benefícios
            </span>
            <h3 className="text-2xl font-extrabold text-[#385463] dark:text-[#7bb0ce] mt-1">
              {formatCurrency(folhaRealizado)}
            </h3>
            <p className="text-xs text-slate-400 font-medium mt-0.5">
              {folhaPackages.length} pacotes de pessoal
            </p>
          </div>
          <div className="p-3 rounded-xl bg-blue-500/10 text-blue-500">
            <Users className="w-5 h-5" />
          </div>
        </div>

        <div
          className={`rounded-xl border p-5 shadow-xs flex items-center justify-between transition-all ${
            isDark ? 'bg-[#18222f] border-slate-700/80 text-white' : 'bg-white border-slate-200/90'
          }`}
        >
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Não Folha (Operação)
            </span>
            <h3 className="text-2xl font-extrabold text-[#e84752] mt-1">
              {formatCurrency(operRealizado)}
            </h3>
            <p className="text-xs text-slate-400 font-medium mt-0.5">
              {operPackages.length} pacotes operacionais
            </p>
          </div>
          <div className="p-3 rounded-xl bg-rose-500/10 text-rose-500">
            <Briefcase className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Horizontal Bar Chart */}
      <div
        className={`rounded-xl border p-5 sm:p-6 shadow-xs transition-all ${
          isDark ? 'bg-[#18222f] border-slate-700/80' : 'bg-white border-slate-200/90'
        }`}
      >
        <div className="flex items-center space-x-2 pb-4 border-b border-slate-100 dark:border-slate-800">
          <BarChart3 className="w-4 h-4 text-[#385463]" />
          <div>
            <h4
              className={`text-xs sm:text-sm font-bold uppercase tracking-wider ${
                isDark ? 'text-slate-200' : 'text-slate-800'
              }`}
            >
              Comparativo por Pacote de Gastos
            </h4>
            <p className="text-xs text-slate-400 mt-0.5">
              Orçado vs Realizado por pacote ordenado pelo maior valor realizado
            </p>
          </div>
        </div>

        <div className="h-[460px] w-full pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              layout="vertical"
              data={chartData}
              margin={{ top: 10, right: 20, left: 20, bottom: 0 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke={isDark ? '#263342' : '#f1f5f9'}
                horizontal={false}
              />
              <XAxis
                type="number"
                stroke="#94a3b8"
                fontSize={11}
                tickLine={false}
                tickFormatter={(val) => `${val.toLocaleString('pt-BR')}`}
              />
              <YAxis
                type="category"
                dataKey="name"
                stroke="#94a3b8"
                fontSize={11}
                tickLine={false}
                width={190}
              />
              <Tooltip
                formatter={(val: any) => [`R$ ${Number(val).toLocaleString('pt-BR')}`, '']}
                contentStyle={{
                  backgroundColor: isDark ? '#18222f' : '#ffffff',
                  borderColor: isDark ? '#334155' : '#e2e8f0',
                  color: isDark ? '#f8fafc' : '#0f172a',
                  borderRadius: '8px',
                  fontSize: '12px'
                }}
              />
              <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '8px' }} />
              <Bar dataKey="Orçado" fill="#385463" opacity={0.65} radius={[0, 4, 4, 0]} />
              <Bar dataKey="Realizado" fill={isDark ? '#e3e0b0' : '#24303b'} radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Detailed Table */}
      <div
        className={`rounded-xl border overflow-hidden shadow-xs transition-all ${
          isDark ? 'bg-[#18222f] border-slate-700/80' : 'bg-white border-slate-200/90'
        }`}
      >
        <div
          className={`p-4 border-b flex flex-wrap gap-2 items-center justify-between ${
            isDark ? 'bg-[#141b25] border-slate-700' : 'bg-slate-50 border-slate-200'
          }`}
        >
          <div>
            <h4
              className={`text-xs font-bold uppercase tracking-wider ${
                isDark ? 'text-slate-200' : 'text-slate-800'
              }`}
            >
              Detalhamento Orçamentário por Pacote
            </h4>
            <span className="text-[10px] text-slate-400 flex items-center space-x-1 mt-0.5">
              <MousePointerClick className="w-3.5 h-3.5" />
              <span>Clique no pacote para ver contas contábeis</span>
            </span>
          </div>

          <button
            type="button"
            onClick={exportToExcel}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-all shadow-sm cursor-pointer ml-auto"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Exportar Pacotes para Excel</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead
              className={`border-b text-[11px] font-bold uppercase tracking-wider ${
                isDark
                  ? 'bg-[#141b25] border-slate-700 text-slate-400'
                  : 'bg-slate-50 border-slate-200 text-slate-500'
              }`}
            >
              <tr>
                <th className="py-3 px-4">Pacote de Gastos</th>
                <th className="py-3 px-4">Classificação</th>
                <th className="py-3 px-4 text-right">Orçado</th>
                <th className="py-3 px-4 text-right">Realizado</th>
                <th className="py-3 px-4 text-right">Desvio (R$)</th>
                <th className="py-3 px-4 text-right">Var (%)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {packages.map((p) => {
                const isOver = p.desvio > 0;
                return (
                  <tr
                    key={p.package}
                    onClick={() => handlePackageClick(p)}
                    title="Clique para abrir drill-down das contas deste pacote"
                    className={`transition-colors cursor-pointer ${
                      isDark ? 'hover:bg-slate-800/60' : 'hover:bg-slate-50'
                    }`}
                  >
                    <td
                      className={`py-2.5 px-4 font-bold ${
                        isDark ? 'text-slate-200' : 'text-slate-800'
                      }`}
                    >
                      {p.package}
                    </td>
                    <td className="py-2.5 px-4">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          p.type === 'Folha'
                            ? 'bg-blue-500/15 text-blue-500 border border-blue-500/30'
                            : 'bg-slate-500/15 text-slate-400 border border-slate-500/30'
                        }`}
                      >
                        {p.type}
                      </span>
                    </td>
                    <td className="py-2.5 px-4 text-right font-medium text-slate-400">
                      {formatCurrency(p.orcado)}
                    </td>
                    <td
                      className={`py-2.5 px-4 text-right font-bold ${
                        isDark ? 'text-white' : 'text-slate-900'
                      }`}
                    >
                      {formatCurrency(p.realizado)}
                    </td>
                    <td
                      className={`py-2.5 px-4 text-right font-extrabold ${
                        isOver ? 'text-[#e84752]' : 'text-emerald-500'
                      }`}
                    >
                      {isOver ? '+' : ''}
                      {formatCurrency(p.desvio)}
                    </td>
                    <td
                      className={`py-2.5 px-4 text-right font-bold ${
                        isOver ? 'text-[#e84752]' : 'text-emerald-500'
                      }`}
                    >
                      {p.desvio_pct >= 0 ? '+' : ''}
                      {p.desvio_pct.toFixed(1)}%
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
