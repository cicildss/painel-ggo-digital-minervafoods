import React from 'react';
import {
  Calendar,
  Sun,
  Moon,
  Filter
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
  selectedMacro: string;
  setSelectedMacro: (macro: string) => void;
  availableMacros: string[];
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
  selectedMacro,
  setSelectedMacro,
  availableMacros,
  scale,
  setScale,
  theme,
  setTheme
}) => {
  const isDark = theme === 'dark';

  return (
    <div
      className={`border-b transition-colors ${
        isDark
          ? 'bg-[#141b25] border-slate-800 text-slate-200'
          : 'bg-white border-slate-200/80 text-slate-700'
      }`}
    >
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs">
        {/* Left Filter Group */}
        <div className="flex flex-wrap items-center gap-2.5">
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
              YTD (Acumulado)
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

          {/* Macroarea Selector */}
          <div
            className={`flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-semibold ${
              isDark
                ? 'bg-slate-800/80 border-slate-700 text-white'
                : 'bg-slate-50 border-slate-200 text-slate-800'
            }`}
          >
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={selectedMacro}
              onChange={(e) => setSelectedMacro(e.target.value)}
              className="bg-transparent font-bold focus:outline-none cursor-pointer max-w-[150px] truncate"
            >
              <option value="ALL" className={isDark ? 'bg-[#18222f]' : 'bg-white'}>
                Todas Macroáreas
              </option>
              {availableMacros.map((macro) => (
                <option key={macro} value={macro} className={isDark ? 'bg-[#18222f]' : 'bg-white'}>
                  {macro}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Right Filter & Theme Group */}
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

          {/* Theme Toggle (Dark / Light) */}
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
    </div>
  );
};
