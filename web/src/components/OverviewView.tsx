import React, { useState } from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  BarChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import {
  DollarSign,
  TrendingDown,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  PieChart as PieIcon,
  BarChart2,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { StatCard } from './StatCard';
import type { MonthlyRecord, CostCenterRecord, PackageRecord } from '../types';

interface OverviewViewProps {
  monthlyData: MonthlyRecord[];
  costCenters: CostCenterRecord[];
  packages: PackageRecord[];
  scale: 'BRL' | 'BRL_1000';
}

export const OverviewView: React.FC<OverviewViewProps> = ({
  monthlyData,
  costCenters,
  packages,
  scale
}) => {
  const [chartView, setChartView] = useState<'comparativo' | 'desvio'>('comparativo');

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

  // Aggregated totals
  const totalOrcado = monthlyData.reduce((acc, curr) => acc + curr.orcado, 0);
  const totalRealizado = monthlyData.reduce((acc, curr) => acc + curr.realizado, 0);
  const totalDesvio = totalRealizado - totalOrcado;
  const desvioPct = totalOrcado > 0 ? (totalDesvio / totalOrcado) * 100 : 0;
  const atingimentoPct = totalOrcado > 0 ? (totalRealizado / totalOrcado) * 100 : 0;

  // Monthly Chart data
  const chartData = monthlyData.map((m) => ({
    name: m.month_name,
    Orçado: Math.round(m.orcado / scaleDivisor),
    Realizado: Math.round(m.realizado / scaleDivisor),
    Desvio: Math.round(m.desvio / scaleDivisor),
    isPositive: m.desvio > 0
  }));

  // Folha vs Não Folha spend breakdown
  const folhaRealizado = packages
    .filter((p) => p.type === 'Folha')
    .reduce((acc, p) => acc + p.realizado, 0);
  const naoFolhaRealizado = packages
    .filter((p) => p.type === 'Não Folha')
    .reduce((acc, p) => acc + p.realizado, 0);

  const pieData = [
    { name: 'Folha & Pessoal', value: folhaRealizado, color: '#385463' },
    { name: 'Não Folha (Operação)', value: naoFolhaRealizado, color: '#24303b' }
  ];

  // Top Ofensores (maiores estouros) e Maiores Economias
  const ofensores = [...costCenters]
    .filter((c) => c.desvio > 0)
    .sort((a, b) => b.desvio - a.desvio)
    .slice(0, 5);

  const maxDesvioOfensor = ofensores.length > 0 ? ofensores[0].desvio : 1;

  const economias = [...costCenters]
    .filter((c) => c.desvio < 0)
    .sort((a, b) => a.desvio - b.desvio)
    .slice(0, 5);

  const maxEconomia = economias.length > 0 ? Math.abs(economias[0].desvio) : 1;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 stagger-children">
        <StatCard
          title="Orçado Consolidado"
          value={formatCurrency(totalOrcado)}
          subValue="Meta orçamentária do período"
          icon={DollarSign}
          accentColor="#385463"
        />

        <StatCard
          title="Realizado Consolidado"
          value={formatCurrency(totalRealizado)}
          subValue={`Atingimento: ${atingimentoPct.toFixed(1)}% do orçamento`}
          icon={TrendingUp}
          accentColor="#24303b"
          badge={{
            text: `${atingimentoPct.toFixed(1)}% atingido`,
            variant: atingimentoPct <= 100 ? 'positive' : 'negative'
          }}
        />

        <StatCard
          title="Desvio Total (R$)"
          value={formatCurrency(totalDesvio)}
          subValue={totalDesvio > 0 ? 'Despesa acima da meta orçada' : 'Economia orçamentária apurada'}
          icon={totalDesvio > 0 ? AlertCircle : CheckCircle2}
          accentColor={totalDesvio > 0 ? '#e84752' : '#10b981'}
          badge={{
            text:
              totalDesvio > 0
                ? `+${formatCurrency(totalDesvio)} acima`
                : `${formatCurrency(Math.abs(totalDesvio))} economia`,
            variant: totalDesvio > 0 ? 'negative' : 'positive'
          }}
        />

        <StatCard
          title="Variação Percentual (%)"
          value={`${desvioPct >= 0 ? '+' : ''}${desvioPct.toFixed(1)}%`}
          subValue={desvioPct > 0 ? 'Desvio desfavorável vs Orçado' : 'Desvio favorável vs Orçado'}
          icon={desvioPct > 0 ? TrendingUp : TrendingDown}
          accentColor={desvioPct > 0 ? '#e84752' : '#10b981'}
          badge={{
            text: desvioPct > 0 ? 'Atenção Controladoria' : 'Meta sob controle',
            variant: desvioPct > 0 ? 'negative' : 'positive'
          }}
        />
      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Monthly Performance Composed Chart */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200/90 p-5 sm:p-6 shadow-xs flex flex-col justify-between">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
            <div>
              <div className="flex items-center space-x-2">
                <BarChart2 className="w-4 h-4 text-[#385463]" />
                <h4 className="text-xs sm:text-sm font-bold text-slate-800 uppercase tracking-wider">
                  Evolução Mensal de Gastos
                </h4>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Execução orçamentária mês a mês e linha de desvio
              </p>
            </div>

            {/* Toggle view buttons */}
            <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-lg">
              <button
                type="button"
                onClick={() => setChartView('comparativo')}
                className={`px-3 py-1 text-xs font-bold rounded-md transition-all cursor-pointer ${
                  chartView === 'comparativo'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Orçado vs Realizado
              </button>
              <button
                type="button"
                onClick={() => setChartView('desvio')}
                className={`px-3 py-1 text-xs font-bold rounded-md transition-all cursor-pointer ${
                  chartView === 'desvio'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Desvio Nominal
              </button>
            </div>
          </div>

          <div className="h-72 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              {chartView === 'comparativo' ? (
                <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <YAxis
                    stroke="#94a3b8"
                    fontSize={11}
                    tickLine={false}
                    tickFormatter={(val) => `${val.toLocaleString('pt-BR')}`}
                  />
                  <Tooltip
                    formatter={(val: any) => [`R$ ${Number(val).toLocaleString('pt-BR')}`, '']}
                    contentStyle={{
                      backgroundColor: '#ffffff',
                      borderColor: '#e2e8f0',
                      borderRadius: '8px',
                      fontSize: '12px',
                      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                  <Bar dataKey="Orçado" fill="#385463" opacity={0.65} radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Realizado" fill="#24303b" radius={[4, 4, 0, 0]} />
                  <Line
                    type="monotone"
                    dataKey="Desvio"
                    stroke="#e84752"
                    strokeWidth={2.5}
                    dot={{ r: 3, fill: '#e84752' }}
                  />
                </ComposedChart>
              ) : (
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <YAxis
                    stroke="#94a3b8"
                    fontSize={11}
                    tickLine={false}
                    tickFormatter={(val) => `${val.toLocaleString('pt-BR')}`}
                  />
                  <Tooltip
                    formatter={(val: any) => [`R$ ${Number(val).toLocaleString('pt-BR')}`, '']}
                    contentStyle={{
                      backgroundColor: '#ffffff',
                      borderColor: '#e2e8f0',
                      borderRadius: '8px',
                      fontSize: '12px'
                    }}
                  />
                  <Bar dataKey="Desvio" radius={[4, 4, 0, 0]}>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.Desvio > 0 ? '#e84752' : '#10b981'} />
                    ))}
                  </Bar>
                </BarChart>
              )}
            </ResponsiveContainer>
          </div>
        </div>

        {/* Spend Composition Donut */}
        <div className="bg-white rounded-xl border border-slate-200/90 p-5 sm:p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center space-x-2 pb-3 border-b border-slate-100">
              <PieIcon className="w-4 h-4 text-[#385463]" />
              <h4 className="text-xs sm:text-sm font-bold text-slate-800 uppercase tracking-wider">
                Estrutura de Gastos
              </h4>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Folha & Pessoal vs Despesas Operacionais
            </p>

            <div className="h-48 w-full mt-2">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(val: any) => [formatCurrency(Number(val)), '']} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="space-y-2.5 pt-3 border-t border-slate-100">
            {pieData.map((p) => {
              const total = folhaRealizado + naoFolhaRealizado;
              const pct = total > 0 ? (p.value / total) * 100 : 0;
              return (
                <div key={p.name} className="flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-2">
                    <span className="w-3 h-3 rounded-md shrink-0" style={{ backgroundColor: p.color }} />
                    <span className="font-semibold text-slate-700">{p.name}</span>
                  </div>
                  <div className="text-right">
                    <span className="font-extrabold text-slate-900">{formatCurrency(p.value)}</span>
                    <span className="text-[10px] text-slate-400 ml-1.5 font-bold">
                      ({pct.toFixed(1)}%)
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Rankings Row: Maiores Ofensores vs Maiores Economias */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Ofensores Card */}
        <div className="bg-white rounded-xl border border-slate-200/90 p-5 sm:p-6 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center space-x-2">
              <div className="p-1.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-600">
                <ArrowUpRight className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Top 5 • Maiores Desvios (Ofensores)
                </h4>
                <p className="text-[11px] text-slate-400">
                  Centros de custo com maior estouro orçamentário
                </p>
              </div>
            </div>
          </div>

          <div className="mt-3 divide-y divide-slate-100 text-xs">
            {ofensores.map((cc) => {
              const pctBar = Math.min(100, Math.max(5, (cc.desvio / maxDesvioOfensor) * 100));
              return (
                <div
                  key={cc.code}
                  className="py-3 flex items-center justify-between hover:bg-slate-50/80 px-2 rounded-lg transition-colors"
                >
                  <div className="pr-4 flex-1 min-w-0">
                    <div className="font-bold text-slate-800 flex items-center space-x-2">
                      <span className="font-mono text-slate-900 font-extrabold">{cc.code}</span>
                      <span className="text-slate-600 font-medium truncate">{cc.description}</span>
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5 truncate">
                      {cc.gestor} • {cc.macroarea}
                    </div>
                    {/* Visual inline progress bar */}
                    <div className="w-full bg-slate-100 h-1.5 rounded-full mt-2 overflow-hidden">
                      <div
                        className="bg-[#e84752] h-full rounded-full transition-all"
                        style={{ width: `${pctBar}%` }}
                      />
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="font-extrabold text-[#e84752]">+{formatCurrency(cc.desvio)}</div>
                    <div className="text-[10px] text-rose-600 font-bold">
                      +{cc.desvio_pct.toFixed(1)}%
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Economias Card */}
        <div className="bg-white rounded-xl border border-slate-200/90 p-5 sm:p-6 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center space-x-2">
              <div className="p-1.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-600">
                <ArrowDownRight className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Top 5 • Maiores Economias
                </h4>
                <p className="text-[11px] text-slate-400">
                  Centros de custo com melhor eficiência orçamentária
                </p>
              </div>
            </div>
          </div>

          <div className="mt-3 divide-y divide-slate-100 text-xs">
            {economias.map((cc) => {
              const absDesv = Math.abs(cc.desvio);
              const pctBar = Math.min(100, Math.max(5, (absDesv / maxEconomia) * 100));
              return (
                <div
                  key={cc.code}
                  className="py-3 flex items-center justify-between hover:bg-slate-50/80 px-2 rounded-lg transition-colors"
                >
                  <div className="pr-4 flex-1 min-w-0">
                    <div className="font-bold text-slate-800 flex items-center space-x-2">
                      <span className="font-mono text-slate-900 font-extrabold">{cc.code}</span>
                      <span className="text-slate-600 font-medium truncate">{cc.description}</span>
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5 truncate">
                      {cc.gestor} • {cc.macroarea}
                    </div>
                    {/* Visual inline progress bar */}
                    <div className="w-full bg-slate-100 h-1.5 rounded-full mt-2 overflow-hidden">
                      <div
                        className="bg-emerald-500 h-full rounded-full transition-all"
                        style={{ width: `${pctBar}%` }}
                      />
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="font-extrabold text-emerald-600">
                      {formatCurrency(cc.desvio)}
                    </div>
                    <div className="text-[10px] text-emerald-700 font-bold">
                      {cc.desvio_pct.toFixed(1)}%
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
