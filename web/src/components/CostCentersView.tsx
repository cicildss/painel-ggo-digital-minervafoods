import React, { useState, useMemo } from 'react';
import { Search, Filter, ArrowUpDown, Building, CheckCircle2, AlertTriangle, ChevronLeft, ChevronRight } from 'lucide-react';
import type { CostCenterRecord } from '../types';

interface CostCentersViewProps {
  costCenters: CostCenterRecord[];
  scale: 'BRL' | 'BRL_1000';
}

export const CostCentersView: React.FC<CostCentersViewProps> = ({ costCenters, scale }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMacro, setSelectedMacro] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'OVER' | 'UNDER'>('ALL');
  const [sortField, setSortField] = useState<'realizado' | 'desvio' | 'desvio_pct'>('realizado');
  const [sortAsc, setSortAsc] = useState(false);
  const [page, setPage] = useState(1);
  const pageSize = 30;

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

  // Distinct macroareas for filter
  const macroareas = useMemo(() => {
    const set = new Set<string>();
    costCenters.forEach((c) => {
      if (c.macroarea && c.macroarea !== '-') set.add(c.macroarea);
    });
    return Array.from(set).sort();
  }, [costCenters]);

  // Totals for top cards
  const totalCenters = costCenters.length;
  const overBudgetCount = costCenters.filter((c) => c.desvio > 0).length;
  const underBudgetCount = costCenters.filter((c) => c.desvio <= 0).length;

  // Filter and sort
  const filteredCenters = useMemo(() => {
    return costCenters
      .filter((cc) => {
        const matchesSearch =
          cc.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
          cc.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          cc.gestor.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesMacro = selectedMacro === 'ALL' || cc.macroarea === selectedMacro;
        const matchesStatus =
          statusFilter === 'ALL' ||
          (statusFilter === 'OVER' && cc.desvio > 0) ||
          (statusFilter === 'UNDER' && cc.desvio <= 0);
        return matchesSearch && matchesMacro && matchesStatus;
      })
      .sort((a, b) => {
        const valA = a[sortField];
        const valB = b[sortField];
        return sortAsc ? valA - valB : valB - valA;
      });
  }, [costCenters, searchTerm, selectedMacro, statusFilter, sortField, sortAsc]);

  const totalPages = Math.ceil(filteredCenters.length / pageSize) || 1;
  const pagedList = filteredCenters.slice((page - 1) * pageSize, page * pageSize);

  const handleSort = (field: 'realizado' | 'desvio' | 'desvio_pct') => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Top Quick Status Counters */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div
          onClick={() => {
            setStatusFilter('ALL');
            setPage(1);
          }}
          className={`p-4 rounded-xl border transition-all cursor-pointer ${
            statusFilter === 'ALL'
              ? 'bg-[#24303b] text-white border-[#385463] shadow-md ring-2 ring-[#385463]'
              : 'bg-white text-slate-800 border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total de Centros</span>
            <Building className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl font-extrabold mt-1">{totalCenters}</div>
          <p className="text-xs text-slate-400 mt-0.5">Visão de todos os centros liberados</p>
        </div>

        <div
          onClick={() => {
            setStatusFilter('OVER');
            setPage(1);
          }}
          className={`p-4 rounded-xl border transition-all cursor-pointer ${
            statusFilter === 'OVER'
              ? 'bg-[#24303b] text-white border-rose-500 shadow-md ring-2 ring-rose-500'
              : 'bg-white text-slate-800 border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-rose-500">Estourados (Acima do Orçado)</span>
            <AlertTriangle className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-2xl font-extrabold text-[#e84752] mt-1">{overBudgetCount}</div>
          <p className="text-xs text-slate-400 mt-0.5">Requer atenção da gestão</p>
        </div>

        <div
          onClick={() => {
            setStatusFilter('UNDER');
            setPage(1);
          }}
          className={`p-4 rounded-xl border transition-all cursor-pointer ${
            statusFilter === 'UNDER'
              ? 'bg-[#24303b] text-white border-emerald-500 shadow-md ring-2 ring-emerald-500'
              : 'bg-white text-slate-800 border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600">Dentro da Meta (Economia)</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-extrabold text-emerald-600 mt-1">{underBudgetCount}</div>
          <p className="text-xs text-slate-400 mt-0.5">Executando conforme o planejado</p>
        </div>
      </div>

      {/* Search & Filter Header */}
      <div className="bg-white rounded-xl border border-slate-200/90 p-4 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="flex items-center space-x-2 w-full md:w-80">
          <div className="relative w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Buscar por código, centro ou gestor..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(1);
              }}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#385463]"
            />
          </div>
        </div>

        <div className="flex items-center space-x-3 w-full md:w-auto">
          <div className="flex items-center space-x-2 text-xs text-slate-600">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span>Macroárea:</span>
            <select
              value={selectedMacro}
              onChange={(e) => {
                setSelectedMacro(e.target.value);
                setPage(1);
              }}
              className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-[#385463]"
            >
              <option value="ALL">Todas as Macroáreas ({macroareas.length})</option>
              {macroareas.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>

          <span className="text-xs text-slate-500 font-medium whitespace-nowrap">
            Mostrando <b>{filteredCenters.length}</b> centro(s)
          </span>
        </div>
      </div>

      {/* Cost Centers Table */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="overflow-x-auto max-h-[620px]">
          <table className="w-full text-xs text-left">
            <thead className="bg-[#1c2630] text-white font-semibold sticky top-0 z-10 border-b border-[#2b3d4a]">
              <tr>
                <th className="py-3 px-3.5">Centro de Custo</th>
                <th className="py-3 px-3.5">Macroárea / Negócio</th>
                <th className="py-3 px-3.5">Gestor Responsável</th>
                <th className="py-3 px-3.5 text-right">Orçado</th>
                <th
                  className="py-3 px-3.5 text-right cursor-pointer hover:bg-[#2b3d4a] transition-colors"
                  onClick={() => handleSort('realizado')}
                >
                  <div className="flex items-center justify-end space-x-1">
                    <span>Realizado</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th
                  className="py-3 px-3.5 text-right cursor-pointer hover:bg-[#2b3d4a] transition-colors"
                  onClick={() => handleSort('desvio')}
                >
                  <div className="flex items-center justify-end space-x-1">
                    <span>Desvio ($)</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th
                  className="py-3 px-3.5 text-right cursor-pointer hover:bg-[#2b3d4a] transition-colors"
                  onClick={() => handleSort('desvio_pct')}
                >
                  <div className="flex items-center justify-end space-x-1">
                    <span>Desvio (%)</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th className="py-3 px-3.5 text-center">Execução Orçamentária</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {pagedList.map((cc) => {
                const atingimento = cc.orcado > 0 ? (cc.realizado / cc.orcado) * 100 : 0;
                const isOverBudget = cc.desvio > 0;
                return (
                  <tr key={cc.code} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-3.5">
                      <div className="font-mono font-extrabold text-slate-900">{cc.code}</div>
                      <div className="text-slate-500 text-[11px] truncate max-w-xs">{cc.description}</div>
                    </td>
                    <td className="py-3 px-3.5 text-slate-600">
                      <div>{cc.macroarea}</div>
                      <div className="text-[10px] text-slate-400">{cc.negocio}</div>
                    </td>
                    <td className="py-3 px-3.5 text-slate-700">
                      <div className="font-semibold">{cc.gestor}</div>
                      {cc.email_gestor && (
                        <div className="text-[10px] text-slate-400 font-mono">{cc.email_gestor}</div>
                      )}
                    </td>
                    <td className="py-3 px-3.5 text-right text-slate-600">{formatCurrency(cc.orcado)}</td>
                    <td className="py-3 px-3.5 text-right font-extrabold text-slate-900">{formatCurrency(cc.realizado)}</td>
                    <td className={`py-3 px-3.5 text-right font-extrabold ${isOverBudget ? 'text-[#e84752]' : 'text-emerald-600'}`}>
                      {cc.desvio > 0 ? '+' : ''}{formatCurrency(cc.desvio)}
                    </td>
                    <td className={`py-3 px-3.5 text-right font-bold ${isOverBudget ? 'text-[#e84752]' : 'text-emerald-600'}`}>
                      {cc.desvio_pct > 0 ? '+' : ''}{cc.desvio_pct.toFixed(1)}%
                    </td>
                    <td className="py-3 px-3.5 text-center">
                      <div className="flex items-center justify-center space-x-2">
                        <div className="w-20 bg-slate-100 rounded-full h-2 overflow-hidden border border-slate-200">
                          <div
                            className={`h-full rounded-full ${isOverBudget ? 'bg-[#e84752]' : 'bg-[#385463]'}`}
                            style={{ width: `${Math.min(atingimento, 100)}%` }}
                          />
                        </div>
                        <span className={`text-[10px] font-bold ${isOverBudget ? 'text-[#e84752]' : 'text-slate-700'}`}>
                          {atingimento.toFixed(0)}%
                        </span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-600">
          <div>
            Mostrando <b>{(page - 1) * pageSize + 1}</b> a{' '}
            <b>{Math.min(page * pageSize, filteredCenters.length)}</b> de <b>{filteredCenters.length}</b> centros
          </div>

          <div className="flex items-center space-x-2">
            <button
              disabled={page === 1}
              onClick={() => setPage((p) => Math.max(p - 1, 1))}
              className="p-1 rounded bg-white border border-slate-300 disabled:opacity-40 hover:bg-slate-100 cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-semibold">
              Página {page} de {totalPages}
            </span>
            <button
              disabled={page === totalPages}
              onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
              className="p-1 rounded bg-white border border-slate-300 disabled:opacity-40 hover:bg-slate-100 cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
