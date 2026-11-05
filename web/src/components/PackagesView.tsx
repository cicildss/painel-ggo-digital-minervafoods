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
import { Layers, Users, Briefcase, BarChart3 } from 'lucide-react';
import type { PackageRecord } from '../types';

interface PackagesViewProps {
  packages: PackageRecord[];
  scale: 'BRL' | 'BRL_1000';
}

export const PackagesView: React.FC<PackagesViewProps> = ({ packages, scale }) => {
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

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 stagger-children">
        <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Total de Pacotes
            </span>
            <h3 className="text-2xl font-extrabold text-slate-900 mt-1">
              {formatCurrency(totalRealizado)}
            </h3>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              {packages.length} pacotes orçamentários monitorados
            </p>
          </div>
          <div className="p-3 rounded-xl bg-blue-50 text-[#385463]">
            <Layers className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Folha & Benefícios
            </span>
            <h3 className="text-2xl font-extrabold text-[#385463] mt-1">
              {formatCurrency(folhaRealizado)}
            </h3>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              {folhaPackages.length} pacotes de pessoal
            </p>
          </div>
          <div className="p-3 rounded-xl bg-slate-100 text-[#385463]">
            <Users className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Não Folha (Operação)
            </span>
            <h3 className="text-2xl font-extrabold text-[#24303b] mt-1">
              {formatCurrency(operRealizado)}
            </h3>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              {operPackages.length} pacotes operacionais
            </p>
          </div>
          <div className="p-3 rounded-xl bg-rose-50 text-[#e84752]">
            <Briefcase className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Horizontal Bar Chart */}
      <div className="bg-white rounded-xl border border-slate-200/90 p-5 sm:p-6 shadow-xs">
        <div className="flex items-center space-x-2 pb-4 border-b border-slate-100">
          <BarChart3 className="w-4 h-4 text-[#385463]" />
          <div>
            <h4 className="text-xs sm:text-sm font-bold text-slate-800 uppercase tracking-wider">
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
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
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
                stroke="#64748b"
                fontSize={11}
                tickLine={false}
                width={190}
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
              <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '8px' }} />
              <Bar dataKey="Orçado" fill="#385463" opacity={0.65} radius={[0, 4, 4, 0]} />
              <Bar dataKey="Realizado" fill="#24303b" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Detailed Table */}
      <div className="bg-white rounded-xl border border-slate-200/90 overflow-hidden shadow-xs">
        <div className="p-4 bg-slate-50 border-b border-slate-200">
          <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            Detalhamento Orçamentário por Pacote
          </h4>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Pacote de Gastos</th>
                <th className="py-3 px-4">Classificação</th>
                <th className="py-3 px-4 text-right">Orçado</th>
                <th className="py-3 px-4 text-right">Realizado</th>
                <th className="py-3 px-4 text-right">Desvio (R$)</th>
                <th className="py-3 px-4 text-right">Var (%)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {packages.map((p) => {
                const isOver = p.desvio > 0;
                return (
                  <tr key={p.package} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-2.5 px-4 font-bold text-slate-800">{p.package}</td>
                    <td className="py-2.5 px-4">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          p.type === 'Folha'
                            ? 'bg-blue-50 text-[#385463] border border-blue-200'
                            : 'bg-slate-100 text-slate-700 border border-slate-200'
                        }`}
                      >
                        {p.type}
                      </span>
                    </td>
                    <td className="py-2.5 px-4 text-right font-medium text-slate-600">
                      {formatCurrency(p.orcado)}
                    </td>
                    <td className="py-2.5 px-4 text-right font-bold text-slate-900">
                      {formatCurrency(p.realizado)}
                    </td>
                    <td
                      className={`py-2.5 px-4 text-right font-extrabold ${
                        isOver ? 'text-[#e84752]' : 'text-emerald-600'
                      }`}
                    >
                      {isOver ? '+' : ''}
                      {formatCurrency(p.desvio)}
                    </td>
                    <td
                      className={`py-2.5 px-4 text-right font-bold ${
                        isOver ? 'text-[#e84752]' : 'text-emerald-600'
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
