import React, { useState, useMemo } from 'react';
import { Search, FileSpreadsheet, ChevronLeft, ChevronRight, FileText, DollarSign, Database } from 'lucide-react';
import * as XLSX from 'xlsx';
import type { AnalyticsRecord } from '../types';

interface AnalyticsViewProps {
  records: AnalyticsRecord[];
  scale: 'BRL' | 'BRL_1000';
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({ records, scale }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'ALL' | 'Orçado' | 'Realizado'>('ALL');
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

  const filtered = useMemo(() => {
    return records.filter((r) => {
      const matchType = filterType === 'ALL' || r.tipo === filterType;
      const matchSearch =
        r.conta.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.desc_conta.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.centro_custo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.desc_centro.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.pacote.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.gestor.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.documento.toLowerCase().includes(searchTerm.toLowerCase());
      return matchType && matchSearch;
    });
  }, [records, searchTerm, filterType]);

  const totalPages = Math.ceil(filtered.length / pageSize) || 1;
  const pageRecords = filtered.slice((page - 1) * pageSize, page * pageSize);

  // Totals for top cards
  const totalVolume = filtered.reduce((acc, r) => acc + r.valor, 0);

  // Excel Export
  const exportToExcel = () => {
    const exportData = filtered.map((r) => ({
      Data: r.data,
      Documento: r.documento,
      'Conta Contábil': r.conta,
      'Descrição Conta': r.desc_conta,
      Pacote: r.pacote,
      'Centro de Custo': r.centro_custo,
      'Descrição Centro': r.desc_centro,
      Gestor: r.gestor,
      'E-mail Gestor': r.email_gestor,
      Macroárea: r.macroarea,
      Tipo: r.tipo,
      'Valor (R$)': r.valor
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'GGO_Base_Analitica');
    XLSX.writeFile(workbook, `GGO_Minerva_Base_Analitica_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  return (
    <div className="space-y-5">
      {/* Analytics Summary Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total de Registros</span>
            <div className="text-2xl font-extrabold text-slate-900 mt-1">{filtered.length}</div>
            <p className="text-xs text-slate-400 mt-0.5">Lançamentos filtrados</p>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-50 text-[#385463]">
            <Database className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Volume Financeiro Filtrado</span>
            <div className="text-2xl font-extrabold text-slate-900 mt-1">{formatCurrency(totalVolume)}</div>
            <p className="text-xs text-slate-400 mt-0.5">Soma total dos lançamentos exibidos</p>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-50 text-[#385463]">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Exportação Executiva</span>
            <div className="mt-2">
              <button
                onClick={exportToExcel}
                className="flex items-center space-x-2 px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-all cursor-pointer"
              >
                <FileSpreadsheet className="w-4 h-4" />
                <span>Exportar Base (.xlsx)</span>
              </button>
            </div>
            <p className="text-[11px] text-slate-400 mt-1.5">Download imediato para Excel</p>
          </div>
          <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600">
            <FileText className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Controls Bar */}
      <div className="bg-white rounded-xl border border-slate-200/90 p-4 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="flex items-center space-x-2 w-full md:w-96">
          <div className="relative w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Buscar por conta, centro, documento ou gestor..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(1);
              }}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#385463]"
            />
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-xs text-slate-400 font-medium mr-1">Tipo de Lançamento:</span>
          {(['ALL', 'Orçado', 'Realizado'] as const).map((t) => (
            <button
              key={t}
              onClick={() => {
                setFilterType(t);
                setPage(1);
              }}
              className={`px-3 py-1 text-xs rounded-md font-bold transition-all cursor-pointer ${
                filterType === t
                  ? 'bg-[#1c2630] text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {t === 'ALL' ? 'Todos' : t}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="overflow-x-auto max-h-[580px]">
          <table className="w-full text-xs text-left">
            <thead className="bg-[#1c2630] text-white font-semibold sticky top-0 z-10 border-b border-[#2b3d4a]">
              <tr>
                <th className="py-2.5 px-3">Data</th>
                <th className="py-2.5 px-3">Documento</th>
                <th className="py-2.5 px-3">Conta Contábil</th>
                <th className="py-2.5 px-3">Pacote</th>
                <th className="py-2.5 px-3">Centro de Custo</th>
                <th className="py-2.5 px-3">Gestor</th>
                <th className="py-2.5 px-3">Tipo</th>
                <th className="py-2.5 px-3 text-right">Valor</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {pageRecords.map((r, i) => (
                <tr key={i} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-2 px-3 text-slate-500 whitespace-nowrap">{r.data}</td>
                  <td className="py-2 px-3 font-mono text-slate-600 font-semibold">{r.documento || '-'}</td>
                  <td className="py-2 px-3">
                    <div className="font-mono font-bold text-slate-900">{r.conta}</div>
                    <div className="text-[11px] text-slate-500 truncate max-w-xs">{r.desc_conta}</div>
                  </td>
                  <td className="py-2 px-3 text-slate-700 font-medium">{r.pacote}</td>
                  <td className="py-2 px-3">
                    <div className="font-mono font-bold text-slate-900">{r.centro_custo}</div>
                    <div className="text-[11px] text-slate-500 truncate max-w-xs">{r.desc_centro}</div>
                  </td>
                  <td className="py-2 px-3 text-slate-600">{r.gestor}</td>
                  <td className="py-2 px-3">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        r.tipo === 'Orçado'
                          ? 'bg-blue-50 text-blue-700 border border-blue-200'
                          : 'bg-slate-100 text-slate-800 border border-slate-300'
                      }`}
                    >
                      {r.tipo}
                    </span>
                  </td>
                  <td className="py-2 px-3 text-right font-extrabold text-slate-900 whitespace-nowrap">
                    {formatCurrency(r.valor)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-600">
          <div>
            Mostrando <b>{(page - 1) * pageSize + 1}</b> a{' '}
            <b>{Math.min(page * pageSize, filtered.length)}</b> de <b>{filtered.length}</b> registros
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
