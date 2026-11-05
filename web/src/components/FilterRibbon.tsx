import React, { useState, useMemo } from 'react';
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
  Briefcase,
  X
} from 'lucide-react';
import { MultiSelectDropdown, type DropdownOption } from './MultiSelectDropdown';

interface FilterRibbonProps {
  selectedYear: number;
  setSelectedYear: (yr: number) => void;
  availableYears: number[];
  selectedMonth: number | 'ALL';
  setSelectedMonth: (m: number | 'ALL') => void;
  availableMonths: { id: number; name: string }[];
  viewMode: 'YTD' | 'MONTH';
  setViewMode: (vm: 'YTD' | 'MONTH') => void;

  // Searchable Multi-Select Hierarchical Filters
  selectedBusinesses: string[];
  setSelectedBusinesses: (bu: string[]) => void;
  availableBusinesses: string[];

  selectedDirectors: string[];
  setSelectedDirectors: (dirs: string[]) => void;
  availableDirectors: string[];

  selectedGerentes: string[];
  setSelectedGerentes: (gers: string[]) => void;
  availableGerentes: string[];

  selectedGestores: string[];
  setSelectedGestores: (gests: string[]) => void;
  availableGestores: string[];

  selectedCostCenters: string[];
  setSelectedCostCenters: (ccs: string[]) => void;
  availableCostCenters: { code: string; description: string }[];

  selectedMacros: string[];
  setSelectedMacros: (macros: string[]) => void;
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
  selectedBusinesses,
  setSelectedBusinesses,
  availableBusinesses,
  selectedDirectors,
  setSelectedDirectors,
  availableDirectors,
  selectedGerentes,
  setSelectedGerentes,
  availableGerentes,
  selectedGestores,
  setSelectedGestores,
  availableGestores,
  selectedCostCenters,
  setSelectedCostCenters,
  availableCostCenters,
  selectedMacros,
  setSelectedMacros,
  availableMacros,
  onResetFilters,
  activeFilterCount,
  scale,
  setScale,
  theme,
  setTheme
}) => {
  const isDark = theme === 'dark';
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(true);

  // Convert array lists to DropdownOption objects
  const businessOptions: DropdownOption[] = useMemo(
    () => availableBusinesses.map((b) => ({ value: b, label: b })),
    [availableBusinesses]
  );

  const directorOptions: DropdownOption[] = useMemo(
    () => availableDirectors.map((d) => ({ value: d, label: d })),
    [availableDirectors]
  );

  const gerenteOptions: DropdownOption[] = useMemo(
    () => availableGerentes.map((g) => ({ value: g, label: g })),
    [availableGerentes]
  );

  const gestorOptions: DropdownOption[] = useMemo(
    () => availableGestores.map((g) => ({ value: g, label: g })),
    [availableGestores]
  );

  const costCenterOptions: DropdownOption[] = useMemo(
    () =>
      availableCostCenters.map((cc) => ({
        value: cc.code,
        label: `${cc.code} - ${cc.description}`,
        subLabel: cc.code
      })),
    [availableCostCenters]
  );

  const macroOptions: DropdownOption[] = useMemo(
    () => availableMacros.map((m) => ({ value: m, label: m })),
    [availableMacros]
  );

  return (
    <div
      className={`border-b transition-colors shadow-xs ${
        isDark
          ? 'bg-[#141b25] border-slate-800 text-slate-200'
          : 'bg-white border-slate-200/80 text-slate-700'
      }`}
    >
      {/* Primary Bar: Period + Scale + Controls */}
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

          {/* Toggle Advanced Multi-Select Filters */}
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
            <span>Filtros Hierárquicos Pesquisáveis</span>
            {activeFilterCount > 0 && (
              <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-extrabold bg-[#e84752] text-white">
                {activeFilterCount}
              </span>
            )}
            {isAdvancedOpen ? (
              <ChevronUp className="w-3.5 h-3.5 ml-0.5" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5 ml-0.5" />
            )}
          </button>

          {/* Reset Filters Button */}
          {activeFilterCount > 0 && (
            <button
              type="button"
              onClick={onResetFilters}
              title="Limpar todos os filtros selecionados e restaurar visão geral"
              className="flex items-center space-x-1 px-2.5 py-1.5 rounded-lg text-xs font-bold text-rose-500 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 transition-all cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Limpar ({activeFilterCount})</span>
            </button>
          )}
        </div>

        {/* Right Scale & Theme Controls */}
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

      {/* Advanced Multi-Select Filters Panel (Searchable Comboboxes) */}
      {isAdvancedOpen && (
        <div
          className={`border-t px-4 sm:px-6 lg:px-8 py-3 animate-fade-in ${
            isDark ? 'bg-[#0f1720]/80 border-slate-800' : 'bg-slate-50/90 border-slate-200/90'
          }`}
        >
          <div className="max-w-[1400px] mx-auto">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center justify-between">
              <div className="flex items-center space-x-1.5">
                <Briefcase className="w-3.5 h-3.5 text-[#385463]" />
                <span>Filtros Organizacionais (Multi-Seleção Pesquisável):</span>
              </div>
              <span className="text-[10px] text-slate-400 font-normal">
                Clique em qualquer filtro para abrir, digitar e selecionar múltiplos itens simultaneamente.
              </span>
            </div>

            {/* Grid of 6 Multi-Select Dropdowns */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2.5">
              {/* 1. Negócio (BU) */}
              <MultiSelectDropdown
                label="Negócio (BU)"
                icon={Building2}
                options={businessOptions}
                selectedValues={selectedBusinesses}
                onChange={setSelectedBusinesses}
                placeholder="Todas as BUs"
                theme={theme}
              />

              {/* 2. Diretoria */}
              <MultiSelectDropdown
                label="Diretoria"
                icon={Users}
                options={directorOptions}
                selectedValues={selectedDirectors}
                onChange={setSelectedDirectors}
                placeholder="Todas Diretorias"
                theme={theme}
              />

              {/* 3. Gerência Executiva */}
              <MultiSelectDropdown
                label="Gerência Exec."
                icon={Users}
                options={gerenteOptions}
                selectedValues={selectedGerentes}
                onChange={setSelectedGerentes}
                placeholder="Todas Gerências"
                theme={theme}
              />

              {/* 4. Gestor do Centro */}
              <MultiSelectDropdown
                label="Gestor de CC"
                icon={Users}
                options={gestorOptions}
                selectedValues={selectedGestores}
                onChange={setSelectedGestores}
                placeholder="Todos Gestores"
                theme={theme}
              />

              {/* 5. Centro de Custo */}
              <MultiSelectDropdown
                label="Centro de Custo"
                icon={Building2}
                options={costCenterOptions}
                selectedValues={selectedCostCenters}
                onChange={setSelectedCostCenters}
                placeholder="Todos Centros"
                theme={theme}
              />

              {/* 6. Macroárea */}
              <MultiSelectDropdown
                label="Macroárea"
                icon={Filter}
                options={macroOptions}
                selectedValues={selectedMacros}
                onChange={setSelectedMacros}
                placeholder="Todas Macroáreas"
                theme={theme}
              />
            </div>

            {/* Active Selected Filter Chips */}
            {activeFilterCount > 0 && (
              <div className="mt-2.5 pt-2 border-t border-slate-200/50 dark:border-slate-800 flex flex-wrap items-center gap-1.5 text-xs">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mr-1">
                  Filtros Ativos:
                </span>

                {/* Businesses Chips */}
                {selectedBusinesses.map((b) => (
                  <span
                    key={`bu-${b}`}
                    className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-[#385463]/15 text-[#385463] dark:text-[#7bb0ce] border border-[#385463]/25"
                  >
                    <span>BU: {b}</span>
                    <button
                      type="button"
                      onClick={() => setSelectedBusinesses(selectedBusinesses.filter((x) => x !== b))}
                      className="hover:text-rose-500 cursor-pointer"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}

                {/* Directors Chips */}
                {selectedDirectors.map((d) => (
                  <span
                    key={`dir-${d}`}
                    className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/25"
                  >
                    <span>Dir: {d}</span>
                    <button
                      type="button"
                      onClick={() => setSelectedDirectors(selectedDirectors.filter((x) => x !== d))}
                      className="hover:text-rose-500 cursor-pointer"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}

                {/* Gerentes Chips */}
                {selectedGerentes.map((g) => (
                  <span
                    key={`ger-${g}`}
                    className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-violet-500/15 text-violet-600 dark:text-violet-400 border border-violet-500/25"
                  >
                    <span>Ger: {g}</span>
                    <button
                      type="button"
                      onClick={() => setSelectedGerentes(selectedGerentes.filter((x) => x !== g))}
                      className="hover:text-rose-500 cursor-pointer"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}

                {/* Gestores Chips */}
                {selectedGestores.map((gest) => (
                  <span
                    key={`gest-${gest}`}
                    className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/25"
                  >
                    <span>Gestor: {gest}</span>
                    <button
                      type="button"
                      onClick={() => setSelectedGestores(selectedGestores.filter((x) => x !== gest))}
                      className="hover:text-rose-500 cursor-pointer"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}

                {/* Cost Center Chips */}
                {selectedCostCenters.map((cc) => (
                  <span
                    key={`cc-${cc}`}
                    className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-[#e84752]/15 text-[#e84752] border border-[#e84752]/25"
                  >
                    <span>CC: {cc}</span>
                    <button
                      type="button"
                      onClick={() => setSelectedCostCenters(selectedCostCenters.filter((x) => x !== cc))}
                      className="hover:text-rose-500 cursor-pointer"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}

                {/* Macro Chips */}
                {selectedMacros.map((m) => (
                  <span
                    key={`macro-${m}`}
                    className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25"
                  >
                    <span>Macro: {m}</span>
                    <button
                      type="button"
                      onClick={() => setSelectedMacros(selectedMacros.filter((x) => x !== m))}
                      className="hover:text-rose-500 cursor-pointer"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
