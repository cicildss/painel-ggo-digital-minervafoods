import React from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
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
import { DollarSign, TrendingDown, TrendingUp, AlertCircle, CheckCircle2 } from 'lucide-react';
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
  // Format currency helper
  const scaleDivisor = scale === 'BRL_1000' ? 1000 : 1;
  const scaleSuffix = scale === 'BRL_1000' ? ' mil' : '';

  const formatCurrency = (val: number) => {
    const scaled = val / scaleDivisor;
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      maximumFractionDigits: scale === 'BRL_1000' ? 1 : 0
    }).format(scaled) + scaleSuffix;
  };

  // Aggregated totals
  const totalOrcado = monthlyData.reduce((acc, curr) => acc + curr.orcado, 0);
  const totalRealizado = monthlyData.reduce((acc, curr) => acc + curr.realizado, 0);
  const totalDesvio = totalRealizado - totalOrcado;
  const desvioPct = totalOrcado > 0 ? (totalDesvio / totalOrcado) * 100 : 0;
  const atingimentoPct = totalOrcado > 0 ? (totalRealizado / totalOrcado) * 100 : 0;

  // Chart data formatting
  const chartData = monthlyData.map((m) => ({
    name: m.month_name,
    Orçado: Math.round(m.orcado / scaleDivisor),
    Realizado: Math.round(m.realizado / scaleDivisor),
    Desvio: Math.round(m.desvio / scaleDivisor),
  }));

  // Folha vs Não Folha
  const folhaRealizado = packages.filter((p) => p.type === 'Folha').reduce((acc, p) => acc + p.realizado, 0);
  const naoFolhaRealizado = packages.filter((p) => p.type === 'Não Folha').reduce((acc, p) => acc + p.realizado, 0);

  const pieData = [
    { name: 'Pacotes Folha (Pessoal)', value: folhaRealizado, color: '#385463' },
    { name: 'Pacotes Não Folha (Operação)', value: naoFolhaRealizado, color: '#24303b' }
  ];

  // Top 5 Centros de Custo
  const topCostCenters = [...costCenters]
    .sort((a, b) => b.realizado - a.realizado)
    .slice(0, 5);

  return (
    <div className="space-y-6">
      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Orçado Acumulado"
          value={formatCurrency(totalOrcado)}
          subValue="Meta planejada no período"
          icon={DollarSign}
          highlightColor="#385463"
        />

        <StatCard
          title="Realizado Acumulado"
          value={formatCurrency(totalRealizado)}
          subValue={`Atingimento: ${atingimentoPct.toFixed(1)}% do orçamento`}
          icon={TrendingUp}
          highlightColor="#24303b"
        />

        <StatCard
          title="Desvio Total (R$)"
          value={formatCurrency(totalDesvio)}
          subValue={totalDesvio > 0 ? 'Despesa acima da meta orçada' : 'Economia em relação à meta'}
          icon={totalDesvio > 0 ? TrendingUp : TrendingDown}
          highlightColor={totalDesvio > 0 ? '#e84752' : '#10b981'}
          badge={{
            text: totalDesvio > 0 ? `+${formatCurrency(totalDesvio)} acima` : `${formatCurrency(Math.abs(totalDesvio))} economia`,
            variant: totalDesvio > 0 ? 'negative' : 'positive'
          }}
        />

        <StatCard
          title="Desvio Percentual (%)"
          value={`${desvioPct >= 0 ? '+' : ''}${desvioPct.toFixed(1)}%`}
          subValue={desvioPct > 0 ? 'Variação desfavorável' : 'Variação favorável'}
          icon={totalDesvio > 0 ? AlertCircle : CheckCircle2}
          highlightColor={totalDesvio > 0 ? '#e84752' : '#10b981'}
          badge={{
            text: desvioPct > 0 ? 'Atenção Controladoria' : 'Meta sob controle',
            variant: desvioPct > 0 ? 'negative' : 'positive'
          }}
        />
      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Monthly Realizado vs Orçado Bar/Line Chart */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
                Evolução Mensal: Realizado vs Orçado
              </h4>
              <p className="text-xs text-slate-500">Comparativo mensal do ano selecionado</p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded bg-slate-100 text-slate-600">
              Escala: {scale === 'BRL_1000' ? 'R$ Mil' : 'R$'}
            </span>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} tickFormatter={(val) => `${val.toLocaleString('pt-BR')}`} />
                <Tooltip
                  formatter={(val: any) => [`R$ ${Number(val).toLocaleString('pt-BR')}`, '']}
                  contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '8px', fontSize: '12px' }}
                />
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                <Bar dataKey="Orçado" fill="#385463" opacity={0.65} radius={[4, 4, 0, 0]} />
                <Bar dataKey="Realizado" fill="#24303b" radius={[4, 4, 0, 0]} />
                <Line type="monotone" dataKey="Desvio" stroke="#e84752" strokeWidth={2.5} dot={{ r: 3 }} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Spend Composition Pie Chart */}
        <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-1">
              Composição de Gastos
            </h4>
            <p className="text-xs text-slate-500 mb-3">Folha de Pagamento vs Outras Despesas</p>

            <div className="h-48 w-full">
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
                  <Tooltip formatter={(val: any) => [formatCurrency(Number(val)), '']} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="space-y-2 pt-3 border-t border-slate-100">
            {pieData.map((p) => {
              const total = folhaRealizado + naoFolhaRealizado;
              const pct = total > 0 ? (p.value / total) * 100 : 0;
              return (
                <div key={p.name} className="flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-2">
                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: p.color }} />
                    <span className="font-medium text-slate-700">{p.name}</span>
                  </div>
                  <span className="font-bold text-slate-900">{pct.toFixed(1)}%</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Top 5 Cost Centers Preview */}
      <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs">
        <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-3">
          Top 5 Centros de Custo com Maior Volume de Gastos
        </h4>
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3">Código</th>
                <th className="py-2.5 px-3">Descrição do Centro</th>
                <th className="py-2.5 px-3">Gestor Responsável</th>
                <th className="py-2.5 px-3 text-right">Orçado</th>
                <th className="py-2.5 px-3 text-right">Realizado</th>
                <th className="py-2.5 px-3 text-right">Desvio ($)</th>
                <th className="py-2.5 px-3 text-right">Desvio (%)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {topCostCenters.map((cc) => (
                <tr key={cc.code} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-2.5 px-3 font-mono text-slate-700 font-bold">{cc.code}</td>
                  <td className="py-2.5 px-3 text-slate-800">{cc.description}</td>
                  <td className="py-2.5 px-3 text-slate-600">{cc.gestor}</td>
                  <td className="py-2.5 px-3 text-right text-slate-600">{formatCurrency(cc.orcado)}</td>
                  <td className="py-2.5 px-3 text-right font-bold text-slate-900">{formatCurrency(cc.realizado)}</td>
                  <td className={`py-2.5 px-3 text-right font-semibold ${cc.desvio > 0 ? 'text-[#e84752]' : 'text-emerald-600'}`}>
                    {cc.desvio > 0 ? '+' : ''}{formatCurrency(cc.desvio)}
                  </td>
                  <td className={`py-2.5 px-3 text-right font-semibold ${cc.desvio_pct > 0 ? 'text-[#e84752]' : 'text-emerald-600'}`}>
                    {cc.desvio_pct > 0 ? '+' : ''}{cc.desvio_pct.toFixed(1)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
