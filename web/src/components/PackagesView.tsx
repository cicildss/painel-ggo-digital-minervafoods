import React, { useState } from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from 'recharts';
import { Layers, Users2, Briefcase, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import type { PackageRecord } from '../types';

interface PackagesViewProps {
  packages: PackageRecord[];
  scale: 'BRL' | 'BRL_1000';
}

export const PackagesView: React.FC<PackagesViewProps> = ({ packages, scale }) => {
  const [filterType, setFilterType] = useState<'ALL' | 'Folha' | 'Não Folha'>('ALL');

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

  const filtered = packages.filter((p) => filterType === 'ALL' || p.type === filterType);

  const chartData = filtered.map((p) => ({
    name: p.package.length > 20 ? p.package.substring(0, 18) + '...' : p.package,
    Orçado: Math.round(p.orcado / scaleDivisor),
    Realizado: Math.round(p.realizado / scaleDivisor),
  }));

  const folhaTotal = packages.filter((p) => p.type === 'Folha').reduce((acc, p) => acc + p.realizado, 0);
  const naoFolhaTotal = packages.filter((p) => p.type === 'Não Folha').reduce((acc, p) => acc + p.realizado, 0);

  return (
    <div className="space-y-6">
      {/* Category Summary Header Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div
          onClick={() => setFilterType('ALL')}
          className={`p-5 rounded-xl border cursor-pointer transition-all ${
            filterType === 'ALL'
              ? 'bg-[#1c2630] text-white border-[#385463] shadow-md ring-2 ring-[#e84752]'
              : 'bg-white text-slate-800 border-slate-200 hover:border-slate-300 shadow-xs'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Todos os Pacotes</span>
            <Layers className={`w-4 h-4 ${filterType === 'ALL' ? 'text-[#e3e0b0]' : 'text-slate-400'}`} />
          </div>
          <div className="mt-2 text-2xl font-extrabold">
            {formatCurrency(folhaTotal + naoFolhaTotal)}
          </div>
          <p className={`text-xs mt-1 ${filterType === 'ALL' ? 'text-slate-300' : 'text-slate-500'}`}>
            Consolidação geral ({packages.length} pacotes ativos)
          </p>
        </div>

        <div
          onClick={() => setFilterType('Folha')}
          className={`p-5 rounded-xl border cursor-pointer transition-all ${
            filterType === 'Folha'
              ? 'bg-[#1c2630] text-white border-[#385463] shadow-md ring-2 ring-[#e84752]'
              : 'bg-white text-slate-800 border-slate-200 hover:border-slate-300 shadow-xs'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Pacotes Folha (Pessoal)</span>
            <Users2 className={`w-4 h-4 ${filterType === 'Folha' ? 'text-[#e3e0b0]' : 'text-slate-400'}`} />
          </div>
          <div className="mt-2 text-2xl font-extrabold text-[#385463]">
            {formatCurrency(folhaTotal)}
          </div>
          <p className={`text-xs mt-1 ${filterType === 'Folha' ? 'text-slate-300' : 'text-slate-500'}`}>
            Salários, horas extras, benefícios e encargos
          </p>
        </div>

        <div
          onClick={() => setFilterType('Não Folha')}
          className={`p-5 rounded-xl border cursor-pointer transition-all ${
            filterType === 'Não Folha'
              ? 'bg-[#1c2630] text-white border-[#385463] shadow-md ring-2 ring-[#e84752]'
              : 'bg-white text-slate-800 border-slate-200 hover:border-slate-300 shadow-xs'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Pacotes Não Folha (Operação)</span>
            <Briefcase className={`w-4 h-4 ${filterType === 'Não Folha' ? 'text-[#e3e0b0]' : 'text-slate-400'}`} />
          </div>
          <div className="mt-2 text-2xl font-extrabold text-[#24303b]">
            {formatCurrency(naoFolhaTotal)}
          </div>
          <p className={`text-xs mt-1 ${filterType === 'Não Folha' ? 'text-slate-300' : 'text-slate-500'}`}>
            Serviços, materiais, fretes, viagens e manutenção
          </p>
        </div>
      </div>

      {/* Comparison Chart */}
      <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-xs">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
          <div>
            <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
              Execução por Pacote: Realizado vs Orçado
            </h4>
            <p className="text-xs text-slate-400">Distribuição financeira por categoria contábil</p>
          </div>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 30 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} angle={-15} textAnchor="end" tickLine={false} />
              <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} tickFormatter={(val) => `${val.toLocaleString('pt-BR')}`} />
              <Tooltip
                formatter={(val: any) => [`R$ ${Number(val).toLocaleString('pt-BR')}`, '']}
                contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '8px', fontSize: '12px' }}
              />
              <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
              <Bar dataKey="Orçado" fill="#385463" opacity={0.65} radius={[4, 4, 0, 0]} />
              <Bar dataKey="Realizado" fill="#24303b" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Packages Table */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-[#1c2630] text-white font-semibold">
              <tr>
                <th className="py-3 px-3.5">Nome do Pacote</th>
                <th className="py-3 px-3.5">Classificação</th>
                <th className="py-3 px-3.5 text-right">Orçado</th>
                <th className="py-3 px-3.5 text-right">Realizado</th>
                <th className="py-3 px-3.5 text-right">Desvio ($)</th>
                <th className="py-3 px-3.5 text-right">Desvio (%)</th>
                <th className="py-3 px-3.5 text-center">Situação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filtered.map((pkg) => {
                const isOver = pkg.desvio > 0;
                return (
                  <tr key={pkg.package} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-3.5 font-extrabold text-slate-800">{pkg.package}</td>
                    <td className="py-3 px-3.5">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          pkg.type === 'Folha'
                            ? 'bg-blue-100 text-blue-800 border border-blue-200'
                            : 'bg-slate-100 text-slate-800 border border-slate-200'
                        }`}
                      >
                        {pkg.type}
                      </span>
                    </td>
                    <td className="py-3 px-3.5 text-right text-slate-600">{formatCurrency(pkg.orcado)}</td>
                    <td className="py-3 px-3.5 text-right font-extrabold text-slate-900">{formatCurrency(pkg.realizado)}</td>
                    <td className={`py-3 px-3.5 text-right font-extrabold ${isOver ? 'text-[#e84752]' : 'text-emerald-600'}`}>
                      {pkg.desvio > 0 ? '+' : ''}{formatCurrency(pkg.desvio)}
                    </td>
                    <td className={`py-3 px-3.5 text-right font-bold ${isOver ? 'text-[#e84752]' : 'text-emerald-600'}`}>
                      {pkg.desvio_pct > 0 ? '+' : ''}{pkg.desvio_pct.toFixed(1)}%
                    </td>
                    <td className="py-3 px-3.5 text-center">
                      <span
                        className={`inline-flex items-center text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                          isOver
                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                            : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        }`}
                      >
                        {isOver ? (
                          <>
                            <ArrowUpRight className="w-3 h-3 mr-0.5 text-rose-600" />
                            Acima da Meta
                          </>
                        ) : (
                          <>
                            <ArrowDownRight className="w-3 h-3 mr-0.5 text-emerald-600" />
                            Economia
                          </>
                        )}
                      </span>
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
