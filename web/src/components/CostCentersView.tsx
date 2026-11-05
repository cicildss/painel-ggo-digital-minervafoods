import React, { useState, useMemo } from 'react';
import {
  Search,
  Building2,
  TrendingUp,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  Filter
} from 'lucide-react';
import type { CostCenterRecord } from '../types';

interface CostCentersViewProps {
  costCenters: CostCenterRecord[];
  scale: 'BRL' | 'BRL_1000';
}

type SortField = 'code' | 'description' | 'gestor' | 'macroarea' | 'orcado' | 'realizado' | 'desvio' | 'desvio_pct';
type SortOrder = 'asc' | 'desc';

export const CostCentersView: React.FC<CostCentersViewProps> = ({ costCenters, scale }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMacro, setSelectedMacro] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACIMA' | 'ABAIXO'>('ALL');
  const [sortField, setSortField] = useState<SortField>('desvio');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [page, setPage] = useState(1);
  const pageSize = 25;

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

  // Unique macroareas
  const macroareas = useMemo(() => {
    const set = new Set(costCenters.map((c) => c.macroarea).filter(Boolean));
    return Array.from(set).sort();
  }, [costCenters]);

  // Filtered & Sorted
  const filtered = useMemo(() => {
    return costCenters
      .filter((cc) => {
        const matchesSearch =
          cc.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
          cc.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          cc.gestor.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesMacro = selectedMacro === 'ALL' || cc.macroarea === selectedMacro;

        const matchesStatus =
          statusFilter === 'ALL' ||
          (statusFilter === 'ACIMA' && cc.desvio > 0) ||
          (statusFilter === 'ABAIXO' && cc.desvio <= 0);

        return matchesSearch && matchesMacro && matchesStatus;
      })
      .sort((a, b) => {
        let valA = a[sortField];
        let valB = b[sortField];

        if (typeof valA === 'string') {
          return sortOrder === 'asc'
            ? (valA as string).localeCompare(valB as string)
            : (valB as string).localeCompare(valA as string);
        }

        return sortOrder === 'asc'
          ? (valA as number) - (valB as number)
          : (valB as number) - (valA as number);
      });
  }, [costCenters, searchTerm, selectedMacro, statusFilter, sortField, sortOrder]);

  const totalPages = Math.ceil(filtered.length / pageSize) || 1;
  const paginated = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, page]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
    setPage(1);
  };

  // Summary counts
  const totalCount = costCenters.length;
  const acimaCount = costCenters.filter((c) => c.desvio > 0).length;
  const abaixoCount = costCenters.filter((c) => c.desvio <= 0).length;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 stagger-children">
        <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Total de Centros
            </span>
            <h3 className="text-2xl font-extrabold text-slate-900 mt-1">{totalCount}</h3>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              centros de custo no escopo
            </p>
          </div>
          <div className="p-3 rounded-xl bg-blue-50 text-[#385463]">
            <Building2 className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Acima do Orçado
            </span>
            <h3 className="text-2xl font-extrabold text-rose-600 mt-1">{acimaCount}</h3>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              centros com desvio desfavorável
            </p>
          </div>
          <div className="p-3 rounded-xl bg-rose-50 text-rose-600">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Dentro / Economia
            </span>
            <h3 className="text-2xl font-extrabold text-emerald-600 mt-1">{abaixoCount}</h3>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              centros com meta sob controle
            </p>
          </div>
          <div className="p-3 rounded-xl bg-emerald-50 text-emerald-600">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-xl border border-slate-200/90 p-4 shadow-xs flex flex-wrap gap-3 items-center justify-between">
        <div className="flex flex-wrap items-center gap-3 flex-1 min-w-[280px]">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px] max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              placeholder="Buscar por código, centro ou gestor..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(1);
              }}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#385463]/30 font-medium"
            />
          </div>

          {/* Macroarea dropdown */}
          <div className="flex items-center space-x-1.5 text-xs text-slate-600">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={selectedMacro}
              onChange={(e) => {
                setSelectedMacro(e.target.value);
                setPage(1);
              }}
              className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-2 text-xs text-slate-700 font-semibold focus:outline-none"
            >
              <option value="ALL">Todas as Macroáreas</option>
              {macroareas.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Status switch buttons */}
        <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-lg">
          <button
            type="button"
            onClick={() => {
              setStatusFilter('ALL');
              setPage(1);
            }}
            className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all cursor-pointer ${
              statusFilter === 'ALL'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Todos ({filtered.length})
          </button>
          <button
            type="button"
            onClick={() => {
              setStatusFilter('ACIMA');
              setPage(1);
            }}
            className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all cursor-pointer ${
              statusFilter === 'ACIMA'
                ? 'bg-white text-rose-700 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Estouro
          </button>
          <button
            type="button"
            onClick={() => {
              setStatusFilter('ABAIXO');
              setPage(1);
            }}
            className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all cursor-pointer ${
              statusFilter === 'ABAIXO'
                ? 'bg-white text-emerald-700 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Economia
          </button>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-xl border border-slate-200/90 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              <tr>
                <th
                  onClick={() => handleSort('code')}
                  className="py-3 px-4 cursor-pointer hover:bg-slate-100/70"
                >
                  <div className="flex items-center space-x-1">
                    <span>Código</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('description')}
                  className="py-3 px-4 cursor-pointer hover:bg-slate-100/70"
                >
                  <div className="flex items-center space-x-1">
                    <span>Descrição do Centro</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('gestor')}
                  className="py-3 px-4 cursor-pointer hover:bg-slate-100/70"
                >
                  <div className="flex items-center space-x-1">
                    <span>Gestor</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('macroarea')}
                  className="py-3 px-4 cursor-pointer hover:bg-slate-100/70"
                >
                  <div className="flex items-center space-x-1">
                    <span>Macroárea</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('orcado')}
                  className="py-3 px-4 text-right cursor-pointer hover:bg-slate-100/70"
                >
                  <div className="flex items-center justify-end space-x-1">
                    <span>Orçado</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('realizado')}
                  className="py-3 px-4 text-right cursor-pointer hover:bg-slate-100/70"
                >
                  <div className="flex items-center justify-end space-x-1">
                    <span>Realizado</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('desvio')}
                  className="py-3 px-4 text-right cursor-pointer hover:bg-slate-100/70"
                >
                  <div className="flex items-center justify-end space-x-1">
                    <span>Desvio (R$)</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('desvio_pct')}
                  className="py-3 px-4 text-right cursor-pointer hover:bg-slate-100/70"
                >
                  <div className="flex items-center justify-end space-x-1">
                    <span>Var (%)</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th className="py-3 px-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginated.map((cc) => {
                const isOver = cc.desvio > 0;
                let statusBadge = {
                  text: 'OK',
                  style: 'bg-emerald-50 text-emerald-700 border-emerald-200'
                };
                if (cc.desvio_pct > 15) {
                  statusBadge = {
                    text: 'Crítico',
                    style: 'bg-rose-50 text-rose-700 border-rose-200'
                  };
                } else if (cc.desvio_pct > 0) {
                  statusBadge = {
                    text: 'Atenção',
                    style: 'bg-amber-50 text-amber-700 border-amber-200'
                  };
                }

                return (
                  <tr key={cc.code} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-2.5 px-4 font-mono font-bold text-slate-900">{cc.code}</td>
                    <td className="py-2.5 px-4 font-semibold text-slate-800 max-w-[220px] truncate">
                      {cc.description}
                    </td>
                    <td className="py-2.5 px-4 text-slate-600 max-w-[160px] truncate">
                      {cc.gestor}
                    </td>
                    <td className="py-2.5 px-4 text-slate-500 text-[11px] font-medium">
                      {cc.macroarea}
                    </td>
                    <td className="py-2.5 px-4 text-right font-medium text-slate-600">
                      {formatCurrency(cc.orcado)}
                    </td>
                    <td className="py-2.5 px-4 text-right font-bold text-slate-900">
                      {formatCurrency(cc.realizado)}
                    </td>
                    <td
                      className={`py-2.5 px-4 text-right font-extrabold ${
                        isOver ? 'text-[#e84752]' : 'text-emerald-600'
                      }`}
                    >
                      {isOver ? '+' : ''}
                      {formatCurrency(cc.desvio)}
                    </td>
                    <td
                      className={`py-2.5 px-4 text-right font-bold ${
                        isOver ? 'text-[#e84752]' : 'text-emerald-600'
                      }`}
                    >
                      {cc.desvio_pct >= 0 ? '+' : ''}
                      {cc.desvio_pct.toFixed(1)}%
                    </td>
                    <td className="py-2.5 px-4 text-center">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold border ${statusBadge.style}`}
                      >
                        {statusBadge.text}
                      </span>
                    </td>
                  </tr>
                );
              })}
              {paginated.length === 0 && (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-xs text-slate-400">
                    Nenhum centro de custo encontrado com os filtros selecionados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="bg-slate-50 px-4 py-3 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <div>
            Exibindo <span className="font-bold text-slate-700">{filtered.length > 0 ? (page - 1) * pageSize + 1 : 0}</span> até{' '}
            <span className="font-bold text-slate-700">{Math.min(page * pageSize, filtered.length)}</span> de{' '}
            <span className="font-bold text-slate-700">{filtered.length}</span> registros
          </div>
          <div className="flex items-center space-x-2">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage(page - 1)}
              className="p-1.5 rounded-md border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs font-semibold px-2">
              Página {page} de {totalPages}
            </span>
            <button
              type="button"
              disabled={page >= totalPages}
              onClick={() => setPage(page + 1)}
              className="p-1.5 rounded-md border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
