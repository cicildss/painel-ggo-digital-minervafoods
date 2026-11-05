import React, { useState, useMemo } from 'react';
import {
  Users,
  TrendingUp,
  CheckCircle2,
  Search,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  FileSpreadsheet,
  ArrowUpRight,
  ArrowDownRight,
  MousePointerClick
} from 'lucide-react';
import * as XLSX from 'xlsx';
import type { CostCenterRecord } from '../types';
import type { DrillDownItem } from './DetailModal';
import { EmptyState } from './EmptyState';

interface ManagersViewProps {
  costCenters: CostCenterRecord[];
  scale: 'BRL' | 'BRL_1000';
  theme?: 'light' | 'dark';
  onSelectDrillDown?: (item: DrillDownItem) => void;
}

interface ManagerSummary {
  name: string;
  email: string;
  macroarea: string;
  costCentersCount: number;
  orcado: number;
  realizado: number;
  desvio: number;
  desvio_pct: number;
  costCenters: CostCenterRecord[];
}

type SortField = 'name' | 'macroarea' | 'costCentersCount' | 'orcado' | 'realizado' | 'desvio' | 'desvio_pct';
type SortOrder = 'asc' | 'desc';

export const ManagersView: React.FC<ManagersViewProps> = ({
  costCenters,
  scale,
  theme = 'light',
  onSelectDrillDown
}) => {
  const isDark = theme === 'dark';
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACIMA' | 'ABAIXO'>('ALL');
  const [sortField, setSortField] = useState<SortField>('desvio');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [page, setPage] = useState(1);
  const pageSize = 20;

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

  // Group cost centers by manager
  const managersData = useMemo(() => {
    const map = new Map<string, ManagerSummary>();

    costCenters.forEach((cc) => {
      const gestorKey = cc.gestor?.trim() || 'Não Atribuído';
      const existing = map.get(gestorKey) || {
        name: gestorKey,
        email: cc.email_gestor || '',
        macroarea: cc.macroarea || 'Corporativo',
        costCentersCount: 0,
        orcado: 0,
        realizado: 0,
        desvio: 0,
        desvio_pct: 0,
        costCenters: []
      };

      existing.costCentersCount += 1;
      existing.orcado += cc.orcado;
      existing.realizado += cc.realizado;
      existing.desvio += cc.desvio;
      existing.costCenters.push(cc);
      if (cc.email_gestor && !existing.email) existing.email = cc.email_gestor;
      if (cc.macroarea && existing.macroarea === 'Corporativo') existing.macroarea = cc.macroarea;

      map.set(gestorKey, existing);
    });

    return Array.from(map.values()).map((m) => ({
      ...m,
      desvio_pct: m.orcado > 0 ? (m.desvio / m.orcado) * 100 : 0
    }));
  }, [costCenters]);

  // Filter & Sort
  const filtered = useMemo(() => {
    return managersData
      .filter((m) => {
        const matchesSearch =
          m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          m.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          m.macroarea.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesStatus =
          statusFilter === 'ALL' ||
          (statusFilter === 'ACIMA' && m.desvio > 0) ||
          (statusFilter === 'ABAIXO' && m.desvio <= 0);

        return matchesSearch && matchesStatus;
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
  }, [managersData, searchTerm, statusFilter, sortField, sortOrder]);

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

  // Top 5 Estouro vs Top 5 Economia
  const topOfensoresGestores = useMemo(() => {
    return [...managersData]
      .filter((m) => m.desvio > 0)
      .sort((a, b) => b.desvio - a.desvio)
      .slice(0, 5);
  }, [managersData]);

  const maxDesvioOfensor = topOfensoresGestores.length > 0 ? topOfensoresGestores[0].desvio : 1;

  const topEconomiaGestores = useMemo(() => {
    return [...managersData]
      .filter((m) => m.desvio < 0)
      .sort((a, b) => a.desvio - b.desvio)
      .slice(0, 5);
  }, [managersData]);

  const maxEconomia = topEconomiaGestores.length > 0 ? Math.abs(topEconomiaGestores[0].desvio) : 1;

  // Counts
  const totalGestores = managersData.length;
  const gestoresAcima = managersData.filter((m) => m.desvio > 0).length;
  const gestoresAbaixo = managersData.filter((m) => m.desvio <= 0).length;

  // Export to Excel
  const exportToExcel = () => {
    const exportData = filtered.map((m) => ({
      Gestor: m.name,
      'E-mail': m.email,
      Macroárea: m.macroarea,
      'Centros de Custo (Qtd)': m.costCentersCount,
      'Orçado (R$)': m.orcado,
      'Realizado (R$)': m.realizado,
      'Desvio Nominal (R$)': m.desvio,
      'Variação (%)': Number(m.desvio_pct.toFixed(2)),
      Status: m.desvio > 0 ? 'Acima do Orçado' : 'Dentro/Economia'
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'GGO_Gestores');
    XLSX.writeFile(wb, `GGO_Minerva_Gestores_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  const handleOpenManager = (m: ManagerSummary) => {
    if (onSelectDrillDown) {
      onSelectDrillDown({
        type: 'cost_center',
        id: `${m.costCentersCount} CCs`,
        title: `Gestão: ${m.name}`,
        orcado: m.orcado,
        realizado: m.realizado,
        desvio: m.desvio,
        desvio_pct: m.desvio_pct,
        gestor: m.name,
        email_gestor: m.email,
        macroarea: m.macroarea
      });
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 stagger-children">
        <div
          className={`rounded-xl border p-5 shadow-xs flex items-center justify-between transition-all ${
            isDark ? 'bg-[#18222f] border-slate-700/80 text-white' : 'bg-white border-slate-200/90'
          }`}
        >
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Lideranças Ativas
            </span>
            <h3 className="text-2xl font-extrabold mt-1">{totalGestores}</h3>
            <p className="text-xs text-slate-400 font-medium mt-0.5">
              gestores com centros de custo atribuídos
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
              Gestores com Estouro
            </span>
            <h3 className="text-2xl font-extrabold text-[#e84752] mt-1">{gestoresAcima}</h3>
            <p className="text-xs text-slate-400 font-medium mt-0.5">
              despesas acumuladas acima da meta orçada
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
              Gestores em Economia
            </span>
            <h3 className="text-2xl font-extrabold text-emerald-500 mt-1">{gestoresAbaixo}</h3>
            <p className="text-xs text-slate-400 font-medium mt-0.5">
              lideranças operando dentro do orçamento
            </p>
          </div>
          <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-500">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Rankings Side-by-Side: Top 5 Estouro vs Top 5 Economia */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top 5 Ofensores */}
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
                  Top 5 Gestores • Maior Desvio Acima
                </h4>
                <p className="text-[10px] text-slate-400">
                  Lideranças com maior valor nominal acima da meta
                </p>
              </div>
            </div>
            <MousePointerClick className="w-3.5 h-3.5 text-slate-400" />
          </div>

          <div className="mt-3 divide-y divide-slate-100 dark:divide-slate-800/80 text-xs">
            {topOfensoresGestores.map((m) => {
              const pctBar = Math.min(100, Math.max(5, (m.desvio / maxDesvioOfensor) * 100));
              return (
                <div
                  key={m.name}
                  onClick={() => handleOpenManager(m)}
                  className={`py-3 flex items-center justify-between px-2 rounded-lg transition-colors cursor-pointer ${
                    isDark ? 'hover:bg-slate-800/50' : 'hover:bg-slate-50'
                  }`}
                >
                  <div className="pr-4 flex-1 min-w-0">
                    <div className="font-bold flex items-center space-x-2">
                      <span
                        className={`truncate ${
                          isDark ? 'text-slate-200' : 'text-slate-800'
                        }`}
                      >
                        {m.name}
                      </span>
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-500/15 text-slate-400 font-semibold">
                        {m.costCentersCount} CCs
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5 truncate">
                      {m.macroarea} • {m.email || 'Email não cadastrado'}
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full mt-2 overflow-hidden">
                      <div
                        className="bg-[#e84752] h-full rounded-full transition-all"
                        style={{ width: `${pctBar}%` }}
                      />
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="font-extrabold text-[#e84752]">+{formatCurrency(m.desvio)}</div>
                    <div className="text-[10px] text-rose-500 font-bold">
                      +{m.desvio_pct.toFixed(1)}%
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top 5 Economia */}
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
                  Top 5 Gestores • Maior Economia
                </h4>
                <p className="text-[10px] text-slate-400">
                  Lideranças com melhor eficiência orçamentária
                </p>
              </div>
            </div>
            <MousePointerClick className="w-3.5 h-3.5 text-slate-400" />
          </div>

          <div className="mt-3 divide-y divide-slate-100 dark:divide-slate-800/80 text-xs">
            {topEconomiaGestores.map((m) => {
              const absDesv = Math.abs(m.desvio);
              const pctBar = Math.min(100, Math.max(5, (absDesv / maxEconomia) * 100));
              return (
                <div
                  key={m.name}
                  onClick={() => handleOpenManager(m)}
                  className={`py-3 flex items-center justify-between px-2 rounded-lg transition-colors cursor-pointer ${
                    isDark ? 'hover:bg-slate-800/50' : 'hover:bg-slate-50'
                  }`}
                >
                  <div className="pr-4 flex-1 min-w-0">
                    <div className="font-bold flex items-center space-x-2">
                      <span
                        className={`truncate ${
                          isDark ? 'text-slate-200' : 'text-slate-800'
                        }`}
                      >
                        {m.name}
                      </span>
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-500/15 text-slate-400 font-semibold">
                        {m.costCentersCount} CCs
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5 truncate">
                      {m.macroarea} • {m.email || 'Email não cadastrado'}
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full mt-2 overflow-hidden">
                      <div
                        className="bg-emerald-500 h-full rounded-full transition-all"
                        style={{ width: `${pctBar}%` }}
                      />
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="font-extrabold text-emerald-500">
                      {formatCurrency(m.desvio)}
                    </div>
                    <div className="text-[10px] text-emerald-600 font-bold">
                      {m.desvio_pct.toFixed(1)}%
                    </div>
                  </div>
                </div>
              );
            })}
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
          <div className="relative flex-1 min-w-[220px] max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              placeholder="Buscar por nome do gestor, e-mail ou macroárea..."
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

          {/* Status buttons */}
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
              Em Estouro
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
              Em Economia
            </button>
          </div>
        </div>

        {/* Excel Export Button */}
        <button
          type="button"
          onClick={exportToExcel}
          className="flex items-center space-x-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-all shadow-sm cursor-pointer ml-auto"
        >
          <FileSpreadsheet className="w-4 h-4" />
          <span>Exportar Gestores para Excel</span>
        </button>
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
                  onClick={() => handleSort('name')}
                  className="py-3 px-4 cursor-pointer hover:opacity-80"
                >
                  <div className="flex items-center space-x-1">
                    <span>Nome do Gestor</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('macroarea')}
                  className="py-3 px-4 cursor-pointer hover:opacity-80"
                >
                  <div className="flex items-center space-x-1">
                    <span>Macroárea / Área</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('costCentersCount')}
                  className="py-3 px-4 text-center cursor-pointer hover:opacity-80"
                >
                  <div className="flex items-center justify-center space-x-1">
                    <span>Centros</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('orcado')}
                  className="py-3 px-4 text-right cursor-pointer hover:opacity-80"
                >
                  <div className="flex items-center justify-end space-x-1">
                    <span>Orçado Total</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('realizado')}
                  className="py-3 px-4 text-right cursor-pointer hover:opacity-80"
                >
                  <div className="flex items-center justify-end space-x-1">
                    <span>Realizado Total</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('desvio')}
                  className="py-3 px-4 text-right cursor-pointer hover:opacity-80"
                >
                  <div className="flex items-center justify-end space-x-1">
                    <span>Desvio Nominal</span>
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
              {paginated.map((m) => {
                const isOver = m.desvio > 0;
                let statusBadge = {
                  text: 'OK',
                  style: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
                };
                if (m.desvio_pct > 15) {
                  statusBadge = {
                    text: 'Crítico',
                    style: 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30'
                  };
                } else if (m.desvio_pct > 0) {
                  statusBadge = {
                    text: 'Atenção',
                    style: 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30'
                  };
                }

                return (
                  <tr
                    key={m.name}
                    onClick={() => handleOpenManager(m)}
                    title="Clique para abrir detalhes da gestão deste líder"
                    className={`transition-colors cursor-pointer ${
                      isDark ? 'hover:bg-slate-800/60' : 'hover:bg-slate-50'
                    }`}
                  >
                    <td className="py-2.5 px-4 font-bold">
                      <div className={isDark ? 'text-white' : 'text-slate-800'}>{m.name}</div>
                      <div className="text-[10px] text-slate-400 font-normal">{m.email || '—'}</div>
                    </td>
                    <td className="py-2.5 px-4 text-slate-400 text-[11px] font-medium">
                      {m.macroarea}
                    </td>
                    <td className="py-2.5 px-4 text-center">
                      <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-500/10 text-slate-400">
                        {m.costCentersCount}
                      </span>
                    </td>
                    <td className="py-2.5 px-4 text-right font-medium text-slate-400">
                      {formatCurrency(m.orcado)}
                    </td>
                    <td
                      className={`py-2.5 px-4 text-right font-bold ${
                        isDark ? 'text-white' : 'text-slate-900'
                      }`}
                    >
                      {formatCurrency(m.realizado)}
                    </td>
                    <td
                      className={`py-2.5 px-4 text-right font-extrabold ${
                        isOver ? 'text-[#e84752]' : 'text-emerald-500'
                      }`}
                    >
                      {isOver ? '+' : ''}
                      {formatCurrency(m.desvio)}
                    </td>
                    <td
                      className={`py-2.5 px-4 text-right font-bold ${
                        isOver ? 'text-[#e84752]' : 'text-emerald-500'
                      }`}
                    >
                      {m.desvio_pct >= 0 ? '+' : ''}
                      {m.desvio_pct.toFixed(1)}%
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
                  <td colSpan={8} className="py-2 px-4">
                    <EmptyState
                      variant="search"
                      title="Nenhum gestor encontrado"
                      description="Tente ajustar o termo de busca ou filtro de status de orçamento."
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
            <span className="font-bold">{filtered.length}</span> gestores
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
