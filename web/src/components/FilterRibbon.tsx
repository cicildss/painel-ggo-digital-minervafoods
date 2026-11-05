import React, { useState } from 'react';
import {
  Calendar,
  Sun,
  Moon,
  Filter,
  Building2,
  Users,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  SlidersHorizontal,
  Briefcase
} from 'lucide-react';

interface FilterRibbonProps {
  selectedYear: number;
  setSelectedYear: (yr: number) => void;
  availableYears: number[];
  selectedMonth: number | 'ALL';
  setSelectedMonth: (m: number | 'ALL') => void;
  availableMonths: { id: number; name: string }[];
  viewMode: 'YTD' | 'MONTH';
  setViewMode: (vm: 'YTD' | 'MONTH') => void;

  // Hierarchical Filters
  selectedBusiness: string;
  setSelectedBusiness: (bu: string) => void;
  availableBusinesses: string[];

  selectedDirector: string;
  setSelectedDirector: (dir: string) => void;
  availableDirectors: string[];

  selectedGerente: string;
  setSelectedGerente: (ger: string) => void;
  availableGerentes: string[];

  selectedGestor: string;
  setSelectedGestor: (gest: string) => void;
  availableGestores: string[];

  selectedCostCenter: string;
  setSelectedCostCenter: (cc: string) => void;
  availableCostCenters: { code: string; description: string }[];

  selectedMacro: string;
  setSelectedMacro: (macro: string) => void;
  availableMacros: string[];

  onResetFilters: () => void;
  activeFilterCount: number;

  scale: 'BRL' | 'BRL_1000';
  setScale: (scale: 'BRL' | 'BRL_1000') => void;
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
}

export const FilterRibbon: React.FC<FilterRibbonProps> = ({
  selectedYear,
  setSelectedYear,
  availableYears,
  selectedMonth,
  setSelectedMonth,
  availableMonths,
  viewMode,
  setViewMode,
  selectedBusiness,
  setSelectedBusiness,
  availableBusinesses,
  selectedDirector,
  setSelectedDirector,
  availableDirectors,
  selectedGerente,
  setSelectedGerente,
  availableGerentes,
  selectedGestor,
  setSelectedGestor,
  availableGestores,
  selectedCostCenter,
  setSelectedCostCenter,
  availableCostCenters,
  selectedMacro,
  setSelectedMacro,
  availableMacros,
  onResetFilters,
  activeFilterCount,
  scale,
  setScale,
  theme,
  setTheme
}) => {
  const isDark = theme === 'dark';
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);

  return (
    <div
      className={`border-b transition-colors shadow-xs ${
        isDark
          ? 'bg-[#141b25] border-slate-800 text-slate-200'
          : 'bg-white border-slate-200/80 text-slate-700'
      }`}
    >
      {/* Primary Bar */}
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs">
        {/* Left Filter Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Year Selector */}
          <div
            className={`flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-semibold ${
              isDark
                ? 'bg-slate-800/80 border-slate-700 text-white'
                : 'bg-slate-50 border-slate-200 text-slate-800'
            }`}
          >
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-[11px] text-slate-400">Ano:</span>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="bg-transparent font-bold focus:outline-none cursor-pointer"
            >
              {availableYears.map((yr) => (
                <option key={yr} value={yr} className={isDark ? 'bg-[#18222f]' : 'bg-white'}>
                  {yr}
                </option>
              ))}
            </select>
          </div>

          {/* Month Selector */}
          <div
            className={`flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-semibold ${
              isDark
                ? 'bg-slate-800/80 border-slate-700 text-white'
                : 'bg-slate-50 border-slate-200 text-slate-800'
            }`}
          >
            <span className="text-[11px] text-slate-400">Mês:</span>
            <select
              value={selectedMonth}
              onChange={(e) =>
                setSelectedMonth(e.target.value === 'ALL' ? 'ALL' : Number(e.target.value))
              }
              className="bg-transparent font-bold focus:outline-none cursor-pointer"
            >
              <option value="ALL" className={isDark ? 'bg-[#18222f]' : 'bg-white'}>
                Ano Todo (12M)
              </option>
              {availableMonths.map((m) => (
                <option key={m.id} value={m.id} className={isDark ? 'bg-[#18222f]' : 'bg-white'}>
                  {m.name}
                </option>
              ))}
            </select>
          </div>

          {/* YTD vs Mês Switcher */}
          <div
            className={`flex items-center p-0.5 rounded-lg border ${
              isDark ? 'bg-slate-800/60 border-slate-700' : 'bg-slate-100 border-slate-200'
            }`}
          >
            <button
              type="button"
              onClick={() => setViewMode('YTD')}
              title="Ano Acumulado até o Mês Selecionado (Year To Date)"
              className={`px-2.5 py-1 text-[11px] font-bold rounded-md transition-all cursor-pointer ${
                viewMode === 'YTD'
                  ? 'bg-[#385463] text-white shadow-xs'
                  : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
              }`}
            >
              YTD
            </button>
            <button
              type="button"
              onClick={() => setViewMode('MONTH')}
              title="Apenas o Mês Selecionado Isoladamente"
              className={`px-2.5 py-1 text-[11px] font-bold rounded-md transition-all cursor-pointer ${
                viewMode === 'MONTH'
                  ? 'bg-[#385463] text-white shadow-xs'
                  : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
              }`}
            >
              Mês Individual
            </button>
          </div>

          {/* Negócio (BU) Quick Selector */}
          <div
            className={`flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-semibold ${
              isDark
                ? 'bg-slate-800/80 border-slate-700 text-white'
                : 'bg-slate-50 border-slate-200 text-slate-800'
            }`}
          >
            <Building2 className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-[11px] text-slate-400">BU:</span>
            <select
              value={selectedBusiness}
              onChange={(e) => setSelectedBusiness(e.target.value)}
              className="bg-transparent font-bold focus:outline-none cursor-pointer max-w-[140px] truncate"
            >
              <option value="ALL" className={isDark ? 'bg-[#18222f]' : 'bg-white'}>
                Todas as BUs
              </option>
              {availableBusinesses.map((b) => (
                <option key={b} value={b} className={isDark ? 'bg-[#18222f]' : 'bg-white'}>
                  {b}
                </option>
              ))}
            </select>
          </div>

          {/* Toggle Advanced Organizational Hierarchy Filters */}
          <button
            type="button"
            onClick={() => setIsAdvancedOpen(!isAdvancedOpen)}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border text-xs font-bold transition-all cursor-pointer ${
              activeFilterCount > 0
                ? 'bg-[#385463] text-white border-[#385463] shadow-xs'
                : isDark
                ? 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-700'
                : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Filtros Hierárquicos</span>
            {activeFilterCount > 0 && (
              <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-extrabold bg-[#e84752] text-white">
                {activeFilterCount}
              </span>
            )}
            {isAdvancedOpen ? <ChevronUp className="w-3.5 h-3.5 ml-0.5" /> : <ChevronDown className="w-3.5 h-3.5 ml-0.5" />}
          </button>

          {/* Reset Filters Button (visible when any filter is active) */}
          {activeFilterCount > 0 && (
            <button
              type="button"
              onClick={onResetFilters}
              title="Limpar todos os filtros hierárquicos e restaurar visão global"
              className="flex items-center space-x-1 px-2.5 py-1.5 rounded-lg text-xs font-bold text-rose-500 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 transition-all cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span className="hidden sm:inline">Limpar</span>
            </button>
          )}
        </div>

        {/* Right Filter & Theme Controls */}
        <div className="flex items-center space-x-2.5 ml-auto">
          {/* Scale Toggle */}
          <div
            className={`flex items-center p-0.5 rounded-lg border ${
              isDark ? 'bg-slate-800/60 border-slate-700' : 'bg-slate-100 border-slate-200'
            }`}
          >
            <button
              type="button"
              onClick={() => setScale('BRL')}
              className={`px-2.5 py-1 text-[11px] font-bold rounded-md transition-all cursor-pointer ${
                scale === 'BRL'
                  ? 'bg-[#e84752] text-white shadow-xs'
                  : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
              }`}
            >
              R$
            </button>
            <button
              type="button"
              onClick={() => setScale('BRL_1000')}
              className={`px-2.5 py-1 text-[11px] font-bold rounded-md transition-all cursor-pointer ${
                scale === 'BRL_1000'
                  ? 'bg-[#e84752] text-white shadow-xs'
                  : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
              }`}
            >
              R$ Mil
            </button>
          </div>

          {/* Theme Toggle */}
          <button
            type="button"
            onClick={() => setTheme(isDark ? 'light' : 'dark')}
            title={isDark ? 'Mudar para Modo Claro' : 'Mudar para Modo Escuro'}
            className={`p-1.5 rounded-lg border transition-all cursor-pointer flex items-center space-x-1.5 text-xs font-semibold ${
              isDark
                ? 'bg-slate-800 border-slate-700 text-[#e3e0b0] hover:bg-slate-700'
                : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
            }`}
          >
            {isDark ? (
              <>
                <Sun className="w-4 h-4 text-[#e3e0b0]" />
                <span className="hidden sm:inline">Claro</span>
              </>
            ) : (
              <>
                <Moon className="w-4 h-4 text-slate-600" />
                <span className="hidden sm:inline">Escuro</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Advanced Organizational Hierarchy Filters (Collapsible Drawer) */}
      {isAdvancedOpen && (
        <div
          className={`border-t px-4 sm:px-6 lg:px-8 py-3 animate-fade-in ${
            isDark ? 'bg-[#0f1720]/80 border-slate-800' : 'bg-slate-50/90 border-slate-200/90'
          }`}
        >
          <div className="max-w-[1400px] mx-auto">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center space-x-1.5">
              <Briefcase className="w-3.5 h-3.5 text-[#385463]" />
              <span>Hierarquia Corporativa Minerva Foods:</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2.5">
              {/* Diretoria */}
              <div
                className={`p-2 rounded-lg border flex flex-col ${
                  isDark ? 'bg-slate-800/80 border-slate-700' : 'bg-white border-slate-200'
                }`}
              >
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center space-x-1">
                  <Users className="w-3 h-3 text-[#385463]" />
                  <span>Diretoria</span>
                </label>
                <select
                  value={selectedDirector}
                  onChange={(e) => setSelectedDirector(e.target.value)}
                  className="bg-transparent text-xs font-semibold focus:outline-none cursor-pointer truncate"
                >
                  <option value="ALL" className={isDark ? 'bg-[#18222f]' : 'bg-white'}>
                    Todas as Diretorias ({availableDirectors.length})
                  </option>
                  {availableDirectors.map((d) => (
                    <option key={d} value={d} className={isDark ? 'bg-[#18222f]' : 'bg-white'}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>

              {/* Gerência Executiva */}
              <div
                className={`p-2 rounded-lg border flex flex-col ${
                  isDark ? 'bg-slate-800/80 border-slate-700' : 'bg-white border-slate-200'
                }`}
              >
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center space-x-1">
                  <Users className="w-3 h-3 text-[#385463]" />
                  <span>Gerência Executiva</span>
                </label>
                <select
                  value={selectedGerente}
                  onChange={(e) => setSelectedGerente(e.target.value)}
                  className="bg-transparent text-xs font-semibold focus:outline-none cursor-pointer truncate"
                >
                  <option value="ALL" className={isDark ? 'bg-[#18222f]' : 'bg-white'}>
                    Todas as Gerências ({availableGerentes.length})
                  </option>
                  {availableGerentes.map((g) => (
                    <option key={g} value={g} className={isDark ? 'bg-[#18222f]' : 'bg-white'}>
                      {g}
                    </option>
                  ))}
                </select>
              </div>

              {/* Gestor Responsável */}
              <div
                className={`p-2 rounded-lg border flex flex-col ${
                  isDark ? 'bg-slate-800/80 border-slate-700' : 'bg-white border-slate-200'
                }`}
              >
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center space-x-1">
                  <Users className="w-3 h-3 text-[#385463]" />
                  <span>Gestor do Centro</span>
                </label>
                <select
                  value={selectedGestor}
                  onChange={(e) => setSelectedGestor(e.target.value)}
                  className="bg-transparent text-xs font-semibold focus:outline-none cursor-pointer truncate"
                >
                  <option value="ALL" className={isDark ? 'bg-[#18222f]' : 'bg-white'}>
                    Todos os Gestores ({availableGestores.length})
                  </option>
                  {availableGestores.map((gest) => (
                    <option key={gest} value={gest} className={isDark ? 'bg-[#18222f]' : 'bg-white'}>
                      {gest}
                    </option>
                  ))}
                </select>
              </div>

              {/* Centro de Custo Específico */}
              <div
                className={`p-2 rounded-lg border flex flex-col ${
                  isDark ? 'bg-slate-800/80 border-slate-700' : 'bg-white border-slate-200'
                }`}
              >
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center space-x-1">
                  <Building2 className="w-3 h-3 text-[#385463]" />
                  <span>Centro de Custo</span>
                </label>
                <select
                  value={selectedCostCenter}
                  onChange={(e) => setSelectedCostCenter(e.target.value)}
                  className="bg-transparent text-xs font-semibold focus:outline-none cursor-pointer truncate"
                >
                  <option value="ALL" className={isDark ? 'bg-[#18222f]' : 'bg-white'}>
                    Todos os Centros ({availableCostCenters.length})
                  </option>
                  {availableCostCenters.map((cc) => (
                    <option key={cc.code} value={cc.code} className={isDark ? 'bg-[#18222f]' : 'bg-white'}>
                      {cc.code} - {cc.description}
                    </option>
                  ))}
                </select>
              </div>

              {/* Macroárea */}
              <div
                className={`p-2 rounded-lg border flex flex-col ${
                  isDark ? 'bg-slate-800/80 border-slate-700' : 'bg-white border-slate-200'
                }`}
              >
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center space-x-1">
                  <Filter className="w-3 h-3 text-[#385463]" />
                  <span>Macroárea</span>
                </label>
                <select
                  value={selectedMacro}
                  onChange={(e) => setSelectedMacro(e.target.value)}
                  className="bg-transparent text-xs font-semibold focus:outline-none cursor-pointer truncate"
                >
                  <option value="ALL" className={isDark ? 'bg-[#18222f]' : 'bg-white'}>
                    Todas Macroáreas ({availableMacros.length})
                  </option>
                  {availableMacros.map((macro) => (
                    <option key={macro} value={macro} className={isDark ? 'bg-[#18222f]' : 'bg-white'}>
                      {macro}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
