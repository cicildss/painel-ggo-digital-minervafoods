import React, { useState, useMemo } from 'react';
import {
  Search,
  Building2,
  TrendingUp,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  Filter,
  FileSpreadsheet
} from 'lucide-react';
import * as XLSX from 'xlsx';
import type { CostCenterRecord } from '../types';
import type { DrillDownItem } from './DetailModal';
import { EmptyState } from './EmptyState';

interface CostCentersViewProps {
  costCenters: CostCenterRecord[];
  scale: 'BRL' | 'BRL_1000';
  theme?: 'light' | 'dark';
  onSelectDrillDown?: (item: DrillDownItem) => void;
}

type SortField = 'code' | 'description' | 'gestor' | 'macroarea' | 'orcado' | 'realizado' | 'desvio' | 'desvio_pct';
type SortOrder = 'asc' | 'desc';

export const CostCentersView: React.FC<CostCentersViewProps> = ({
  costCenters,
  scale,
  theme = 'light',
  onSelectDrillDown
}) => {
  const isDark = theme === 'dark';
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

  const handleRowClick = (cc: CostCenterRecord) => {
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

  const exportToExcel = () => {
    const exportData = filtered.map((cc) => ({
      'Código': cc.code,
      'Descrição': cc.description,
      'Gestor': cc.gestor,
      'E-mail Gestor': cc.email_gestor,
      'Macroárea': cc.macroarea,
      'Negócio': cc.negocio,
      'Orçado (R$)': cc.orcado,
      'Realizado (R$)': cc.realizado,
      'Desvio Nominal (R$)': cc.desvio,
      'Variação (%)': Number(cc.desvio_pct.toFixed(2)),
      'Status': cc.desvio > 0 ? 'Acima do Orçado' : 'Dentro/Economia'
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Centros_de_Custo');
    XLSX.writeFile(wb, `GGO_Minerva_CentrosCusto_${new Date().toISOString().slice(0, 10)}.xlsx`);
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
              Total de Centros
            </span>
            <h3 className="text-2xl font-extrabold mt-1">{totalCount}</h3>
            <p className="text-xs text-slate-400 font-medium mt-0.5">
              centros de custo no escopo
            </p>
          </div>
          <div className="p-3 rounded-xl bg-blue-500/10 text-blue-500">
            <Building2 className="w-5 h-5" />
          </div>
        </div>

        <div
          className={`rounded-xl border p-5 shadow-xs flex items-center justify-between transition-all ${
            isDark ? 'bg-[#18222f] border-slate-700/80 text-white' : 'bg-white border-slate-200/90'
          }`}
        >
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Acima do Orçado
            </span>
            <h3 className="text-2xl font-extrabold text-[#e84752] mt-1">{acimaCount}</h3>
            <p className="text-xs text-slate-400 font-medium mt-0.5">
              centros com desvio desfavorável
            </p>
          </div>
          <div className="p-3 rounded-xl bg-rose-500/10 text-rose-500">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>

        <div
          className={`rounded-xl border p-5 shadow-xs flex items-center justify-between transition-all ${
            isDark ? 'bg-[#18222f] border-slate-700/80 text-white' : 'bg-white border-slate-200/90'
          }`}
        >
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Dentro / Economia
            </span>
            <h3 className="text-2xl font-extrabold text-emerald-500 mt-1">{abaixoCount}</h3>
            <p className="text-xs text-slate-400 font-medium mt-0.5">
              centros com meta sob controle
            </p>
          </div>
          <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-500">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div
        className={`rounded-xl border p-4 shadow-xs flex flex-wrap gap-3 items-center justify-between transition-all ${
          isDark ? 'bg-[#18222f] border-slate-700/80' : 'bg-white border-slate-200/90'
        }`}
      >
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
              className={`w-full pl-9 pr-3 py-2 rounded-lg text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#385463]/40 border ${
                isDark
                  ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-500'
                  : 'bg-slate-50 border-slate-200 text-slate-800 placeholder-slate-400'
              }`}
            />
          </div>

          {/* Macroarea dropdown */}
          <div className="flex items-center space-x-1.5 text-xs text-slate-400">
            <Filter className="w-3.5 h-3.5" />
            <select
              value={selectedMacro}
              onChange={(e) => {
                setSelectedMacro(e.target.value);
                setPage(1);
              }}
              className={`border rounded-lg px-2.5 py-2 text-xs font-semibold focus:outline-none ${
                isDark
                  ? 'bg-slate-800 border-slate-700 text-slate-200'
                  : 'bg-slate-50 border-slate-200 text-slate-700'
              }`}
            >
              <option value="ALL">Todas as Macroáreas</option>
              {macroareas.map((m) => (
                <option key={m} value={m} className={isDark ? 'bg-[#18222f]' : 'bg-white'}>
                  {m}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Right side: Status switch buttons & Excel Export */}
        <div className="flex flex-wrap items-center gap-2.5 ml-auto">
          <div
            className={`flex items-center space-x-1 p-1 rounded-lg ${
              isDark ? 'bg-slate-800' : 'bg-slate-100'
            }`}
          >
            <button
              type="button"
              onClick={() => {
                setStatusFilter('ALL');
                setPage(1);
              }}
              className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all cursor-pointer ${
                statusFilter === 'ALL'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
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
                  ? 'bg-white dark:bg-slate-700 text-rose-600 dark:text-rose-400 shadow-xs'
                  : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
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
                  ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-xs'
                  : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
              }`}
            >
              Economia
            </button>
          </div>

          <button
            type="button"
            onClick={exportToExcel}
            className="flex items-center space-x-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-all shadow-sm cursor-pointer"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Exportar Excel</span>
          </button>
        </div>
      </div>

      {/* Main Table */}
      <div
        className={`rounded-xl border overflow-hidden shadow-xs transition-all ${
          isDark ? 'bg-[#18222f] border-slate-700/80' : 'bg-white border-slate-200/90'
        }`}
      >
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
                <th
                  onClick={() => handleSort('code')}
                  className="py-3 px-4 cursor-pointer hover:opacity-80"
                >
                  <div className="flex items-center space-x-1">
                    <span>Código</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('description')}
                  className="py-3 px-4 cursor-pointer hover:opacity-80"
                >
                  <div className="flex items-center space-x-1">
                    <span>Descrição do Centro</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('gestor')}
                  className="py-3 px-4 cursor-pointer hover:opacity-80"
                >
                  <div className="flex items-center space-x-1">
                    <span>Gestor</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('macroarea')}
                  className="py-3 px-4 cursor-pointer hover:opacity-80"
                >
                  <div className="flex items-center space-x-1">
                    <span>Macroárea</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('orcado')}
                  className="py-3 px-4 text-right cursor-pointer hover:opacity-80"
                >
                  <div className="flex items-center justify-end space-x-1">
                    <span>Orçado</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('realizado')}
                  className="py-3 px-4 text-right cursor-pointer hover:opacity-80"
                >
                  <div className="flex items-center justify-end space-x-1">
                    <span>Realizado</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('desvio')}
                  className="py-3 px-4 text-right cursor-pointer hover:opacity-80"
                >
                  <div className="flex items-center justify-end space-x-1">
                    <span>Desvio (R$)</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('desvio_pct')}
                  className="py-3 px-4 text-right cursor-pointer hover:opacity-80"
                >
                  <div className="flex items-center justify-end space-x-1">
                    <span>Var (%)</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th className="py-3 px-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {paginated.map((cc) => {
                const isOver = cc.desvio > 0;
                let statusBadge = {
                  text: 'OK',
                  style: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
                };
                if (cc.desvio_pct > 15) {
                  statusBadge = {
                    text: 'Crítico',
                    style: 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30'
                  };
                } else if (cc.desvio_pct > 0) {
                  statusBadge = {
                    text: 'Atenção',
                    style: 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30'
                  };
                }

                return (
                  <tr
                    key={cc.code}
                    onClick={() => handleRowClick(cc)}
                    title="Clique para abrir drill-down deste centro de custo"
                    className={`transition-colors cursor-pointer ${
                      isDark ? 'hover:bg-slate-800/60' : 'hover:bg-slate-50'
                    }`}
                  >
                    <td className="py-2.5 px-4 font-mono font-bold text-[#e84752]">{cc.code}</td>
                    <td
                      className={`py-2.5 px-4 font-semibold max-w-[220px] truncate ${
                        isDark ? 'text-slate-200' : 'text-slate-800'
                      }`}
                    >
                      {cc.description}
                    </td>
                    <td className="py-2.5 px-4 text-slate-400 max-w-[160px] truncate">
                      {cc.gestor}
                    </td>
                    <td className="py-2.5 px-4 text-slate-400 text-[11px] font-medium">
                      {cc.macroarea || '—'}
                    </td>
                    <td className="py-2.5 px-4 text-right font-medium text-slate-400">
                      {formatCurrency(cc.orcado)}
                    </td>
                    <td
                      className={`py-2.5 px-4 text-right font-bold ${
                        isDark ? 'text-white' : 'text-slate-900'
                      }`}
                    >
                      {formatCurrency(cc.realizado)}
                    </td>
                    <td
                      className={`py-2.5 px-4 text-right font-extrabold ${
                        isOver ? 'text-[#e84752]' : 'text-emerald-500'
                      }`}
                    >
                      {isOver ? '+' : ''}
                      {formatCurrency(cc.desvio)}
                    </td>
                    <td
                      className={`py-2.5 px-4 text-right font-bold ${
                        isOver ? 'text-[#e84752]' : 'text-emerald-500'
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
                  <td colSpan={9} className="py-2 px-4">
                    <EmptyState
                      variant="search"
                      title="Nenhum centro de custo encontrado"
                      description="Tente ajustar o termo de busca, macroárea ou filtro de status."
                      theme={theme}
                    />
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div
          className={`px-4 py-3 border-t flex items-center justify-between text-xs ${
            isDark
              ? 'bg-[#141b25] border-slate-700 text-slate-400'
              : 'bg-slate-50 border-slate-200 text-slate-500'
          }`}
        >
          <div>
            Exibindo <span className="font-bold">{filtered.length > 0 ? (page - 1) * pageSize + 1 : 0}</span> até{' '}
            <span className="font-bold">{Math.min(page * pageSize, filtered.length)}</span> de{' '}
            <span className="font-bold">{filtered.length}</span> registros
          </div>
          <div className="flex items-center space-x-2">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage(page - 1)}
              className={`p-1.5 rounded-md border disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer ${
                isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-200'
              }`}
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
              className={`p-1.5 rounded-md border disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer ${
                isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-200'
              }`}
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
