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
  ArrowDownRight,
  MousePointerClick,
  Sparkles
} from 'lucide-react';
import { StatCard } from './StatCard';
import { ExecutiveGauge } from './ExecutiveGauge';
import type { MonthlyRecord, CostCenterRecord, PackageRecord } from '../types';
import type { DrillDownItem } from './DetailModal';

interface OverviewViewProps {
  monthlyData: MonthlyRecord[];
  costCenters: CostCenterRecord[];
  packages: PackageRecord[];
  scale: 'BRL' | 'BRL_1000';
  theme?: 'light' | 'dark';
  onSelectDrillDown?: (item: DrillDownItem) => void;
}

export const OverviewView: React.FC<OverviewViewProps> = ({
  monthlyData,
  costCenters,
  packages,
  scale,
  theme = 'light',
  onSelectDrillDown
}) => {
  const isDark = theme === 'dark';
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
    { name: 'Não Folha (Operação)', value: naoFolhaRealizado, color: isDark ? '#4b6b82' : '#24303b' }
  ];

  // Top Ofensores e Economias
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

  const centrosEstouroCount = costCenters.filter((c) => c.desvio > 0).length;

  // Run-Rate Forecast
  const mesesExecutados = monthlyData.filter((m) => m.realizado > 0).length;
  const mediaRealMensal = mesesExecutados > 0 ? totalRealizado / mesesExecutados : 0;
  const projecao12M = mediaRealMensal * 12;
  const orcadoAnual12M = mesesExecutados > 0
    ? (totalOrcado / mesesExecutados) * 12
    : totalOrcado;
  const gapProjecao = projecao12M - orcadoAnual12M;

  const handleOpenCC = (cc: CostCenterRecord) => {
    if (onSelectDrillDown) {
      onSelectDrillDown({
        type: 'cost_center',
        id: cc.code,
        title: cc.description,
        orcado: cc.orcado,
        realizado: cc.realizado,
        desvio: cc.desvio,
        desvio_pct: cc.desvio_pct,
        gestor: cc.gestor,
        email_gestor: cc.email_gestor,
        macroarea: cc.macroarea,
        negocio: cc.negocio
      });
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Executive Narrative Briefing Bar */}
      <div
        className={`p-4 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs shadow-xs transition-all ${
          isDark
            ? 'bg-gradient-to-r from-[#18222f] via-[#1c2837] to-[#18222f] border-slate-700/80 text-slate-200'
            : 'bg-gradient-to-r from-blue-50/70 via-slate-50 to-white border-slate-200 text-slate-700'
        }`}
      >
        <div className="flex items-start sm:items-center space-x-3">
          <div className="p-2 rounded-lg bg-[#385463]/15 text-[#385463] dark:text-[#7bb0ce] shrink-0">
            <Sparkles className="w-4 h-4" />
          </div>
          <div className="leading-relaxed">
            <span className="font-extrabold text-slate-900 dark:text-white uppercase tracking-wider text-[11px] block sm:inline mr-2">
              Resumo Executivo da Controladoria:
            </span>
            <span>
              Gastos operacionais acumulados em <strong className="font-bold">{formatCurrency(totalRealizado)}</strong> (
              <strong className="font-bold">{atingimentoPct.toFixed(1)}%</strong> da meta orçada de {formatCurrency(totalOrcado)}).
              {totalDesvio > 0 ? (
                <> A companhia opera com <span className="font-extrabold text-[#e84752]">pressão de +{formatCurrency(totalDesvio)}</span> acima do orçado, com {centrosEstouroCount} centros demandando acompanhamento.</>
              ) : (
                <> A companhia opera com <span className="font-extrabold text-emerald-500">eficiência de {formatCurrency(Math.abs(totalDesvio))}</span> abaixo do orçamento corporativo.</>
              )}
            </span>
          </div>
        </div>

        <div className="shrink-0 flex items-center space-x-2 w-full sm:w-auto justify-end pt-1 sm:pt-0">
          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-white/70 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
            {costCenters.length} Centros Analisados
          </span>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 stagger-children">
        <StatCard
          title="Orçado Consolidado"
          value={formatCurrency(totalOrcado)}
          subValue="Meta orçamentária do período"
          icon={DollarSign}
          accentColor="#385463"
          theme={theme}
        />

        <StatCard
          title="Realizado Consolidado"
          value={formatCurrency(totalRealizado)}
          subValue={`Atingimento: ${atingimentoPct.toFixed(1)}% do orçamento`}
          icon={TrendingUp}
          accentColor="#24303b"
          theme={theme}
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
          theme={theme}
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
          theme={theme}
          badge={{
            text: desvioPct > 0 ? 'Atenção Controladoria' : 'Meta sob controle',
            variant: desvioPct > 0 ? 'negative' : 'positive'
          }}
        />
      </div>

      {/* Row 2: Monthly Evolution Chart + Executive Gauge Thermometer */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Monthly Performance Composed Chart */}
        <div
          className={`lg:col-span-2 rounded-xl border p-5 sm:p-6 shadow-xs flex flex-col justify-between transition-all ${
            isDark ? 'bg-[#18222f] border-slate-700/80' : 'bg-white border-slate-200/90'
          }`}
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 gap-3">
            <div>
              <div className="flex items-center space-x-2">
                <BarChart2 className="w-4 h-4 text-[#385463]" />
                <h4
                  className={`text-xs sm:text-sm font-bold uppercase tracking-wider ${
                    isDark ? 'text-slate-200' : 'text-slate-800'
                  }`}
                >
                  Evolução Mensal de Gastos
                </h4>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Execução orçamentária mês a mês e linha de desvio
              </p>
            </div>

            {/* Toggle view buttons */}
            <div
              className={`flex items-center space-x-1 p-1 rounded-lg ${
                isDark ? 'bg-slate-800' : 'bg-slate-100'
              }`}
            >
              <button
                type="button"
                onClick={() => setChartView('comparativo')}
                className={`px-3 py-1 text-xs font-bold rounded-md transition-all cursor-pointer ${
                  chartView === 'comparativo'
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                }`}
              >
                Orçado vs Realizado
              </button>
              <button
                type="button"
                onClick={() => setChartView('desvio')}
                className={`px-3 py-1 text-xs font-bold rounded-md transition-all cursor-pointer ${
                  chartView === 'desvio'
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
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
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke={isDark ? '#263342' : '#f1f5f9'}
                    vertical={false}
                  />
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
                      backgroundColor: isDark ? '#18222f' : '#ffffff',
                      borderColor: isDark ? '#334155' : '#e2e8f0',
                      color: isDark ? '#f8fafc' : '#0f172a',
                      borderRadius: '8px',
                      fontSize: '12px'
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                  <Bar dataKey="Orçado" fill="#385463" opacity={0.65} radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Realizado" fill={isDark ? '#e3e0b0' : '#24303b'} radius={[4, 4, 0, 0]} />
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
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke={isDark ? '#263342' : '#f1f5f9'}
                    vertical={false}
                  />
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
                      backgroundColor: isDark ? '#18222f' : '#ffffff',
                      borderColor: isDark ? '#334155' : '#e2e8f0',
                      color: isDark ? '#f8fafc' : '#0f172a',
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

        {/* Executive Gauge Thermometer */}
        <ExecutiveGauge
          atingimentoPct={atingimentoPct}
          topOfensorName={ofensores[0]?.description}
          topOfensorVal={ofensores[0] ? `+${formatCurrency(ofensores[0].desvio)}` : undefined}
          centrosEstouroCount={centrosEstouroCount}
          totalCentros={costCenters.length}
          isDark={isDark}
        />
      </div>

      {/* Row 2.5: Run-Rate Forecast */}
      <div className="animate-slide-up">
        {/* Run-Rate Forecast Card */}
        <div className={`rounded-xl border p-5 sm:p-6 shadow-xs transition-all ${
          isDark ? 'bg-[#18222f] border-slate-700/80' : 'bg-white border-slate-200/90'
        }`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 gap-3">
            <div className="flex items-center space-x-2">
              <div className="p-1.5 rounded-lg bg-violet-500/10 border border-violet-500/20 text-violet-500">
                <TrendingUp className="w-4 h-4" />
              </div>
              <div>
                <h4 className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                  Projeção de Fechamento Anual (Run-Rate)
                </h4>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  Estimativa de encerramento com base na média dos meses executados
                </p>
              </div>
            </div>
            <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full border ${
              isDark ? 'bg-slate-800 border-slate-700 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-600'
            }`}>
              {mesesExecutados} de 12 meses executados
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4">
            {/* Média Mensal */}
            <div className={`rounded-lg p-3.5 ${isDark ? 'bg-slate-800/50' : 'bg-slate-50'}`}>
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Média Mensal Real.</div>
              <div className={`text-base font-extrabold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                {mesesExecutados > 0 ? formatCurrency(totalRealizado / mesesExecutados) : '—'}
              </div>
            </div>

            {/* Projeção 12M */}
            <div className={`rounded-lg p-3.5 border ${
              projecao12M > orcadoAnual12M
                ? 'border-rose-500/30 bg-rose-500/5'
                : 'border-emerald-500/30 bg-emerald-500/5'
            }`}>
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Projeção 12M</div>
              <div className={`text-base font-extrabold ${
                projecao12M > orcadoAnual12M ? 'text-rose-500' : 'text-emerald-500'
              }`}>
                {mesesExecutados > 0 ? formatCurrency(projecao12M) : '—'}
              </div>
            </div>

            {/* Orçado Anual */}
            <div className={`rounded-lg p-3.5 ${isDark ? 'bg-slate-800/50' : 'bg-slate-50'}`}>
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Orçado Anual Ref.</div>
              <div className={`text-base font-extrabold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                {formatCurrency(orcadoAnual12M)}
              </div>
            </div>

            {/* Gap de Projeção */}
            <div className={`rounded-lg p-3.5 border ${
              gapProjecao > 0
                ? 'border-rose-500/30 bg-rose-500/5'
                : 'border-emerald-500/30 bg-emerald-500/5'
            }`}>
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Gap Projetado</div>
              <div className={`text-base font-extrabold ${gapProjecao > 0 ? 'text-rose-500' : 'text-emerald-500'}`}>
                {mesesExecutados > 0
                  ? `${gapProjecao >= 0 ? '+' : ''}${formatCurrency(gapProjecao)}`
                  : '—'}
              </div>
              <div className={`text-[10px] font-semibold mt-0.5 ${gapProjecao > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                {mesesExecutados > 0
                  ? (gapProjecao > 0 ? '▲ Risco de estouro' : '▼ Economia projetada')
                  : ''}
              </div>
            </div>
          </div>

          {/* Progress bar */}
          <div className="mt-4">
            <div className="flex justify-between text-[10px] text-slate-400 mb-1.5">
              <span>Progresso do ano</span>
              <span className="font-bold">{((mesesExecutados / 12) * 100).toFixed(0)}%</span>
            </div>
            <div className={`w-full h-2 rounded-full overflow-hidden ${isDark ? 'bg-slate-700' : 'bg-slate-200'}`}>
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{
                  width: `${(mesesExecutados / 12) * 100}%`,
                  backgroundColor: projecao12M > orcadoAnual12M ? '#e84752' : '#10b981'
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Row 3: Spend Donut + Rankings */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Spend Composition Donut */}
        <div
          className={`rounded-xl border p-5 sm:p-6 shadow-xs flex flex-col justify-between transition-all ${
            isDark ? 'bg-[#18222f] border-slate-700/80' : 'bg-white border-slate-200/90'
          }`}
        >
          <div>
            <div className="flex items-center space-x-2 pb-3 border-b border-slate-100 dark:border-slate-800">
              <PieIcon className="w-4 h-4 text-[#385463]" />
              <h4
                className={`text-xs sm:text-sm font-bold uppercase tracking-wider ${
                  isDark ? 'text-slate-200' : 'text-slate-800'
                }`}
              >
                Estrutura de Gastos
              </h4>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Folha & Pessoal vs Despesas Operacionais
            </p>

            <div className="h-44 w-full mt-2">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(val: any) => [formatCurrency(Number(val)), '']}
                    contentStyle={{
                      backgroundColor: isDark ? '#18222f' : '#ffffff',
                      borderColor: isDark ? '#334155' : '#e2e8f0',
                      color: isDark ? '#f8fafc' : '#0f172a',
                      borderRadius: '8px'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="space-y-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
            {pieData.map((p) => {
              const total = folhaRealizado + naoFolhaRealizado;
              const pct = total > 0 ? (p.value / total) * 100 : 0;
              return (
                <div key={p.name} className="flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-2">
                    <span className="w-3 h-3 rounded-md shrink-0" style={{ backgroundColor: p.color }} />
                    <span className={`font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                      {p.name}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className={`font-extrabold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                      {formatCurrency(p.value)}
                    </span>
                    <span className="text-[10px] text-slate-400 ml-1.5 font-bold">
                      ({pct.toFixed(1)}%)
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Ofensores Card */}
        <div
          className={`rounded-xl border p-5 sm:p-6 shadow-xs transition-all ${
            isDark ? 'bg-[#18222f] border-slate-700/80' : 'bg-white border-slate-200/90'
          }`}
        >
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center space-x-2">
              <div className="p-1.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-500">
                <ArrowUpRight className="w-4 h-4" />
              </div>
              <div>
                <h4
                  className={`text-xs font-bold uppercase tracking-wider ${
                    isDark ? 'text-slate-200' : 'text-slate-900'
                  }`}
                >
                  Top 5 • Maiores Desvios
                </h4>
                <p className="text-[10px] text-slate-400">Clique para abrir drill-down detalhado</p>
              </div>
            </div>
            <MousePointerClick className="w-3.5 h-3.5 text-slate-400" />
          </div>

          <div className="mt-2 divide-y divide-slate-100 dark:divide-slate-800/80 text-xs">
            {ofensores.map((cc) => {
              const pctBar = Math.min(100, Math.max(5, (cc.desvio / maxDesvioOfensor) * 100));
              return (
                <div
                  key={cc.code}
                  onClick={() => handleOpenCC(cc)}
                  className={`py-2.5 flex items-center justify-between px-2 rounded-lg transition-colors cursor-pointer ${
                    isDark ? 'hover:bg-slate-800/50' : 'hover:bg-slate-50'
                  }`}
                >
                  <div className="pr-3 flex-1 min-w-0">
                    <div className="font-bold flex items-center space-x-2">
                      <span className="font-mono font-extrabold text-[#e84752]">{cc.code}</span>
                      <span
                        className={`font-medium truncate ${
                          isDark ? 'text-slate-300' : 'text-slate-700'
                        }`}
                      >
                        {cc.description}
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-400 mt-0.5 truncate">{cc.gestor}</div>
                    <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full mt-1.5 overflow-hidden">
                      <div
                        className="bg-[#e84752] h-full rounded-full transition-all"
                        style={{ width: `${pctBar}%` }}
                      />
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="font-extrabold text-[#e84752]">+{formatCurrency(cc.desvio)}</div>
                    <div className="text-[10px] text-rose-500 font-bold">
                      +{cc.desvio_pct.toFixed(1)}%
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Economias Card */}
        <div
          className={`rounded-xl border p-5 sm:p-6 shadow-xs transition-all ${
            isDark ? 'bg-[#18222f] border-slate-700/80' : 'bg-white border-slate-200/90'
          }`}
        >
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center space-x-2">
              <div className="p-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-500">
                <ArrowDownRight className="w-4 h-4" />
              </div>
              <div>
                <h4
                  className={`text-xs font-bold uppercase tracking-wider ${
                    isDark ? 'text-slate-200' : 'text-slate-900'
                  }`}
                >
                  Top 5 • Maiores Economias
                </h4>
                <p className="text-[10px] text-slate-400">Clique para abrir drill-down detalhado</p>
              </div>
            </div>
            <MousePointerClick className="w-3.5 h-3.5 text-slate-400" />
          </div>

          <div className="mt-2 divide-y divide-slate-100 dark:divide-slate-800/80 text-xs">
            {economias.map((cc) => {
              const absDesv = Math.abs(cc.desvio);
              const pctBar = Math.min(100, Math.max(5, (absDesv / maxEconomia) * 100));
              return (
                <div
                  key={cc.code}
                  onClick={() => handleOpenCC(cc)}
                  className={`py-2.5 flex items-center justify-between px-2 rounded-lg transition-colors cursor-pointer ${
                    isDark ? 'hover:bg-slate-800/50' : 'hover:bg-slate-50'
                  }`}
                >
                  <div className="pr-3 flex-1 min-w-0">
                    <div className="font-bold flex items-center space-x-2">
                      <span className="font-mono font-extrabold text-emerald-500">{cc.code}</span>
                      <span
                        className={`font-medium truncate ${
                          isDark ? 'text-slate-300' : 'text-slate-700'
                        }`}
                      >
                        {cc.description}
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-400 mt-0.5 truncate">{cc.gestor}</div>
                    <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full mt-1.5 overflow-hidden">
                      <div
                        className="bg-emerald-500 h-full rounded-full transition-all"
                        style={{ width: `${pctBar}%` }}
                      />
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="font-extrabold text-emerald-500">
                      {formatCurrency(cc.desvio)}
                    </div>
                    <div className="text-[10px] text-emerald-600 font-bold">
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
