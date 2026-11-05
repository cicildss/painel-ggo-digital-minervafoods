import React, { useState, useMemo } from 'react';
import {
  Search,
  FileSpreadsheet,
  ChevronLeft,
  ChevronRight,
  Database,
  DollarSign,
  TrendingUp,
  Filter
} from 'lucide-react';
import * as XLSX from 'xlsx';
import type { AnalyticsRecord } from '../types';

interface AnalyticsViewProps {
  records: AnalyticsRecord[];
  scale: 'BRL' | 'BRL_1000';
  theme?: 'light' | 'dark';
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({
  records,
  scale,
  theme = 'light'
}) => {
  const isDark = theme === 'dark';
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'ALL' | 'Orçado' | 'Realizado'>('ALL');
  const [page, setPage] = useState(1);
  const pageSize = 30;

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

  // Filtered records
  const filtered = useMemo(() => {
    return records.filter((r) => {
      const matchesSearch =
        r.centro_custo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.desc_centro.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.conta.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.desc_conta.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.gestor.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.pacote.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesType = filterType === 'ALL' || r.tipo === filterType;

      return matchesSearch && matchesType;
    });
  }, [records, searchTerm, filterType]);

  const totalPages = Math.ceil(filtered.length / pageSize) || 1;
  const paginated = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, page]);

  // Aggregated totals
  const totalOrcado = filtered
    .filter((r) => r.tipo === 'Orçado')
    .reduce((acc, r) => acc + r.valor, 0);
  const totalRealizado = filtered
    .filter((r) => r.tipo === 'Realizado')
    .reduce((acc, r) => acc + r.valor, 0);

  // Excel export
  const exportToExcel = () => {
    const exportData = filtered.map((r) => ({
      Data: r.data,
      Documento: r.documento,
      'Conta Contábil': r.conta,
      'Descrição Conta': r.desc_conta,
      Pacote: r.pacote,
      'Centro Custo': r.centro_custo,
      'Descrição Centro': r.desc_centro,
      Gestor: r.gestor,
      'E-mail Gestor': r.email_gestor,
      Macroárea: r.macroarea,
      Tipo: r.tipo,
      'Valor (R$)': r.valor
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'GGO_Analitico');
    XLSX.writeFile(wb, `GGO_Minerva_Base_Analitica_${new Date().toISOString().slice(0, 10)}.xlsx`);
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
              Registros no Escopo
            </span>
            <h3 className="text-2xl font-extrabold mt-1">
              {filtered.length.toLocaleString('pt-BR')}
            </h3>
            <p className="text-xs text-slate-400 font-medium mt-0.5">
              linhas filtradas para auditoria
            </p>
          </div>
          <div className="p-3 rounded-xl bg-blue-500/10 text-blue-500">
            <Database className="w-5 h-5" />
          </div>
        </div>

        <div
          className={`rounded-xl border p-5 shadow-xs flex items-center justify-between transition-all ${
            isDark ? 'bg-[#18222f] border-slate-700/80 text-white' : 'bg-white border-slate-200/90'
          }`}
        >
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Orçado Filtrado
            </span>
            <h3 className="text-2xl font-extrabold text-[#385463] dark:text-[#7bb0ce] mt-1">
              {formatCurrency(totalOrcado)}
            </h3>
            <p className="text-xs text-slate-400 font-medium mt-0.5">
              meta orçamentária dos registros
            </p>
          </div>
          <div className="p-3 rounded-xl bg-blue-500/10 text-blue-500">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>

        <div
          className={`rounded-xl border p-5 shadow-xs flex items-center justify-between transition-all ${
            isDark ? 'bg-[#18222f] border-slate-700/80 text-white' : 'bg-white border-slate-200/90'
          }`}
        >
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Realizado Filtrado
            </span>
            <h3 className="text-2xl font-extrabold mt-1">{formatCurrency(totalRealizado)}</h3>
            <p className="text-xs text-slate-400 font-medium mt-0.5">
              execução contábil acumulada
            </p>
          </div>
          <div className="p-3 rounded-xl bg-slate-500/10 text-slate-400">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filter Bar with Export */}
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
              placeholder="Buscar por conta, centro, pacote ou gestor..."
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

          {/* Type filter */}
          <div className="flex items-center space-x-1.5 text-xs text-slate-400">
            <Filter className="w-3.5 h-3.5" />
            <select
              value={filterType}
              onChange={(e) => {
                setFilterType(e.target.value as any);
                setPage(1);
              }}
              className={`border rounded-lg px-2.5 py-2 text-xs font-semibold focus:outline-none ${
                isDark
                  ? 'bg-slate-800 border-slate-700 text-slate-200'
                  : 'bg-slate-50 border-slate-200 text-slate-700'
              }`}
            >
              <option value="ALL">Todos os Tipos</option>
              <option value="Orçado">Apenas Orçado</option>
              <option value="Realizado">Apenas Realizado</option>
            </select>
          </div>
        </div>

        {/* Excel Export Button */}
        <button
          type="button"
          onClick={exportToExcel}
          className="flex items-center space-x-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-all shadow-sm cursor-pointer ml-auto"
        >
          <FileSpreadsheet className="w-4 h-4" />
          <span>Exportar para Excel</span>
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
                <th className="py-3 px-4">Data</th>
                <th className="py-3 px-4">Documento</th>
                <th className="py-3 px-4">Conta</th>
                <th className="py-3 px-4">Descrição da Conta</th>
                <th className="py-3 px-4">Pacote</th>
                <th className="py-3 px-4">Centro de Custo</th>
                <th className="py-3 px-4">Gestor</th>
                <th className="py-3 px-4 text-center">Tipo</th>
                <th className="py-3 px-4 text-right">Valor</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {paginated.map((r, idx) => (
                <tr
                  key={`${r.documento}-${idx}`}
                  className={`transition-colors ${
                    isDark
                      ? idx % 2 === 0
                        ? 'bg-transparent hover:bg-slate-800/60'
                        : 'bg-slate-800/30 hover:bg-slate-800/60'
                      : idx % 2 === 0
                      ? 'bg-white hover:bg-slate-50'
                      : 'bg-slate-50/70 hover:bg-slate-100/70'
                  }`}
                >
                  <td className="py-2.5 px-4 text-slate-400 font-mono text-[11px] whitespace-nowrap">
                    {r.data}
                  </td>
                  <td className="py-2.5 px-4 font-mono font-medium text-slate-400">
                    {r.documento || '—'}
                  </td>
                  <td className="py-2.5 px-4 font-mono font-bold text-[#e84752]">{r.conta}</td>
                  <td
                    className={`py-2.5 px-4 font-medium max-w-[200px] truncate ${
                      isDark ? 'text-slate-200' : 'text-slate-700'
                    }`}
                  >
                    {r.desc_conta}
                  </td>
                  <td className="py-2.5 px-4 text-slate-400">{r.pacote}</td>
                  <td className="py-2.5 px-4">
                    <div className="font-mono font-bold text-slate-300 dark:text-slate-200">
                      {r.centro_custo}
                    </div>
                    <div className="text-[10px] text-slate-400 truncate max-w-[150px]">
                      {r.desc_centro}
                    </div>
                  </td>
                  <td className="py-2.5 px-4 text-slate-400 max-w-[130px] truncate">{r.gestor}</td>
                  <td className="py-2.5 px-4 text-center">
                    <span
                      className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        r.tipo === 'Orçado'
                          ? 'bg-blue-500/15 text-blue-500 border border-blue-500/30'
                          : 'bg-emerald-500/15 text-emerald-500 border border-emerald-500/30'
                      }`}
                    >
                      {r.tipo}
                    </span>
                  </td>
                  <td
                    className={`py-2.5 px-4 text-right font-extrabold ${
                      isDark ? 'text-white' : 'text-slate-900'
                    }`}
                  >
                    {formatCurrency(r.valor)}
                  </td>
                </tr>
              ))}
              {paginated.length === 0 && (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-xs text-slate-400">
                    Nenhum registro encontrado com os filtros selecionados.
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
            <span className="font-bold">{filtered.length.toLocaleString('pt-BR')}</span> registros
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
