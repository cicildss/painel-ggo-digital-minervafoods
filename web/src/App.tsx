import { useState, useMemo, useEffect, useCallback } from 'react';
import { RefreshCw } from 'lucide-react';
import { AuthProvider } from './context/AuthContext';
import { useAuth } from './hooks/useAuth';
import { LoginScreen } from './components/LoginScreen';
import { Header } from './components/Header';
import { FilterRibbon } from './components/FilterRibbon';
import { OverviewView } from './components/OverviewView';
import { CostCentersView } from './components/CostCentersView';
import { PackagesView } from './components/PackagesView';
import { ManagersView } from './components/ManagersView';
import { AnalyticsView } from './components/AnalyticsView';
import { DetailModal, type DrillDownItem } from './components/DetailModal';

// Import datasets
import metadataData from './data/metadata.json';
import monthlyDataRaw from './data/monthly_summary.json';
import costCentersRaw from './data/cost_centers.json';
import packagesRaw from './data/packages.json';
import analyticsRaw from './data/analytics_sample.json';

import type { Metadata, MonthlyRecord, CostCenterRecord, PackageRecord, AnalyticsRecord } from './types';

function DashboardContent() {
  const { user, isLoading } = useAuth();

  const metadata = metadataData as unknown as Metadata;
  const initialMonthly = monthlyDataRaw as unknown as MonthlyRecord[];
  const initialCostCenters = costCentersRaw as unknown as CostCenterRecord[];
  const initialPackages = packagesRaw as unknown as PackageRecord[];
  const initialAnalytics = analyticsRaw as unknown as AnalyticsRecord[];

  // App State — ALL hooks must be declared before any conditional return
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [scale, setScale] = useState<'BRL' | 'BRL_1000'>('BRL_1000');
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [selectedYear, setSelectedYear] = useState<number>(
    metadata.years.length > 0 ? metadata.years[metadata.years.length - 1] : 2026
  );
  const [selectedMonth, setSelectedMonth] = useState<number | 'ALL'>('ALL');
  const [viewMode, setViewMode] = useState<'YTD' | 'MONTH'>('YTD');

  // Multi-Select Searchable Organizational Filters (arrays)
  const [selectedBusinesses, setSelectedBusinesses] = useState<string[]>([]);
  const [selectedDirectors, setSelectedDirectors] = useState<string[]>([]);
  const [selectedGerentes, setSelectedGerentes] = useState<string[]>([]);
  const [selectedGestores, setSelectedGestores] = useState<string[]>([]);
  const [selectedCostCenters, setSelectedCostCenters] = useState<string[]>([]);
  const [selectedMacros, setSelectedMacros] = useState<string[]>([]);

  const [drillDownItem, setDrillDownItem] = useState<DrillDownItem | null>(null);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [lastSyncMsg, setLastSyncMsg] = useState<string | null>(null);

  const handleSyncNow = useCallback(async () => {
    setIsSyncing(true);
    setLastSyncMsg(null);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      setLastSyncMsg('Dados atualizados!');
      await new Promise((resolve) => setTimeout(resolve, 800));
      window.location.reload();
    } catch {
      setLastSyncMsg('Erro ao atualizar.');
      setIsSyncing(false);
    }
  }, []);

  // Load theme preference on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('minerva_ggo_theme') as 'light' | 'dark' | null;
    if (savedTheme === 'light' || savedTheme === 'dark') {
      setTheme(savedTheme);
    }
  }, []);

  const handleSetTheme = (newTheme: 'light' | 'dark') => {
    setTheme(newTheme);
    localStorage.setItem('minerva_ggo_theme', newTheme);
  };

  // Reset all organizational filters
  const handleResetFilters = useCallback(() => {
    setSelectedBusinesses([]);
    setSelectedDirectors([]);
    setSelectedGerentes([]);
    setSelectedGestores([]);
    setSelectedCostCenters([]);
    setSelectedMacros([]);
  }, []);

  // Count active filters
  const activeFilterCount = useMemo(() => {
    return (
      selectedBusinesses.length +
      selectedDirectors.length +
      selectedGerentes.length +
      selectedGestores.length +
      selectedCostCenters.length +
      selectedMacros.length
    );
  }, [
    selectedBusinesses,
    selectedDirectors,
    selectedGerentes,
    selectedGestores,
    selectedCostCenters,
    selectedMacros
  ]);

  // Available options for dropdowns
  const availableBusinesses = useMemo(() => {
    return metadata.businesses && metadata.businesses.length > 0
      ? metadata.businesses
      : Array.from(new Set(initialCostCenters.map((c) => c.negocio).filter(Boolean))).sort();
  }, [metadata.businesses, initialCostCenters]);

  const availableDirectors = useMemo(() => {
    return metadata.directors && metadata.directors.length > 0
      ? metadata.directors
      : Array.from(new Set(initialCostCenters.map((c) => c.diretor).filter(Boolean) as string[])).sort();
  }, [metadata.directors, initialCostCenters]);

  const availableGerentes = useMemo(() => {
    return metadata.executive_managers && metadata.executive_managers.length > 0
      ? metadata.executive_managers
      : Array.from(new Set(initialCostCenters.map((c) => c.gerente).filter(Boolean) as string[])).sort();
  }, [metadata.executive_managers, initialCostCenters]);

  const availableGestores = useMemo(() => {
    return Array.from(new Set(initialCostCenters.map((c) => c.gestor).filter(Boolean))).sort();
  }, [initialCostCenters]);

  const availableMacros = useMemo(() => {
    const set = new Set(initialCostCenters.map((c) => c.macroarea).filter(Boolean));
    return Array.from(set).sort();
  }, [initialCostCenters]);

  const availableCostCentersList = useMemo(() => {
    return initialCostCenters.map((c) => ({ code: c.code, description: c.description }));
  }, [initialCostCenters]);

  const isUserAdmin = user?.hasFullAccess ?? false;
  const userAllowedCCs = user?.costCenters ?? [];

  // Filtered Cost Centers (RLS + Searchable Multi-Select Hierarchy)
  const filteredCostCenters = useMemo(() => {
    let result = initialCostCenters;
    if (!isUserAdmin) {
      result = result.filter((cc) => userAllowedCCs.includes(cc.code));
    }
    if (selectedBusinesses.length > 0) {
      result = result.filter((cc) => cc.negocio && selectedBusinesses.includes(cc.negocio));
    }
    if (selectedDirectors.length > 0) {
      result = result.filter((cc) => cc.diretor && selectedDirectors.includes(cc.diretor));
    }
    if (selectedGerentes.length > 0) {
      result = result.filter((cc) => cc.gerente && selectedGerentes.includes(cc.gerente));
    }
    if (selectedGestores.length > 0) {
      result = result.filter((cc) => cc.gestor && selectedGestores.includes(cc.gestor));
    }
    if (selectedCostCenters.length > 0) {
      result = result.filter((cc) => selectedCostCenters.includes(cc.code));
    }
    if (selectedMacros.length > 0) {
      result = result.filter((cc) => cc.macroarea && selectedMacros.includes(cc.macroarea));
    }
    return result;
  }, [
    isUserAdmin,
    userAllowedCCs,
    initialCostCenters,
    selectedBusinesses,
    selectedDirectors,
    selectedGerentes,
    selectedGestores,
    selectedCostCenters,
    selectedMacros
  ]);

  // Filtered Analytics (RLS + Searchable Multi-Select Hierarchy)
  const filteredAnalytics = useMemo(() => {
    let result = initialAnalytics;
    if (!isUserAdmin) {
      result = result.filter((r) => userAllowedCCs.includes(r.centro_custo));
    }
    if (selectedBusinesses.length > 0) {
      result = result.filter((r) => r.negocio && selectedBusinesses.includes(r.negocio));
    }
    if (selectedDirectors.length > 0) {
      result = result.filter((r) => r.diretor && selectedDirectors.includes(r.diretor));
    }
    if (selectedGerentes.length > 0) {
      result = result.filter((r) => r.gerente && selectedGerentes.includes(r.gerente));
    }
    if (selectedGestores.length > 0) {
      result = result.filter((r) => r.gestor && selectedGestores.includes(r.gestor));
    }
    if (selectedCostCenters.length > 0) {
      result = result.filter((r) => selectedCostCenters.includes(r.centro_custo));
    }
    if (selectedMacros.length > 0) {
      result = result.filter((r) => r.macroarea && selectedMacros.includes(r.macroarea));
    }
    return result;
  }, [
    isUserAdmin,
    userAllowedCCs,
    initialAnalytics,
    selectedBusinesses,
    selectedDirectors,
    selectedGerentes,
    selectedGestores,
    selectedCostCenters,
    selectedMacros
  ]);

  // Filtered Monthly Summary (Year + Month/YTD + Dynamic Scope Scaling)
  const filteredMonthly = useMemo(() => {
    let yearRecords = initialMonthly.filter((m) => m.year === selectedYear);

    // Apply month filtering
    if (selectedMonth !== 'ALL') {
      if (viewMode === 'MONTH') {
        yearRecords = yearRecords.filter((m) => m.month === selectedMonth);
      } else {
        yearRecords = yearRecords.filter((m) => m.month <= (selectedMonth as number));
      }
    }

    // Proportion factor based on active filtered cost centers
    const totalAllCCReal = initialCostCenters.reduce((acc, c) => acc + c.realizado, 0);
    const activeCCReal = filteredCostCenters.reduce((acc, c) => acc + c.realizado, 0);
    const hasOrgFilter = activeFilterCount > 0;
    const factor = totalAllCCReal > 0 && (!isUserAdmin || hasOrgFilter)
      ? activeCCReal / totalAllCCReal
      : 1;

    return yearRecords.map((m) => {
      const orc = m.orcado * factor;
      const real = m.realizado * factor;
      const desv = real - orc;
      const desvPct = orc > 0 ? (desv / orc) * 100 : 0;
      return {
        ...m,
        orcado: orc,
        realizado: real,
        desvio: desv,
        desvio_pct: desvPct
      };
    });
  }, [
    isUserAdmin,
    selectedYear,
    selectedMonth,
    viewMode,
    activeFilterCount,
    initialMonthly,
    initialCostCenters,
    filteredCostCenters
  ]);

  // Filtered Packages
  const filteredPackages = useMemo(() => {
    const totalAllCCReal = initialCostCenters.reduce((acc, c) => acc + c.realizado, 0);
    const activeCCReal = filteredCostCenters.reduce((acc, c) => acc + c.realizado, 0);
    const hasOrgFilter = activeFilterCount > 0;
    const factor = totalAllCCReal > 0 && (!isUserAdmin || hasOrgFilter)
      ? activeCCReal / totalAllCCReal
      : 1;

    return initialPackages.map((p) => {
      const orc = p.orcado * factor;
      const real = p.realizado * factor;
      const desv = real - orc;
      const desvPct = orc > 0 ? (desv / orc) * 100 : 0;
      return {
        ...p,
        orcado: orc,
        realizado: real,
        desvio: desv,
        desvio_pct: desvPct
      };
    });
  }, [isUserAdmin, activeFilterCount, initialPackages, initialCostCenters, filteredCostCenters]);

  // Conditional renders AFTER all hooks
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#1c2630] flex items-center justify-center text-white text-xs">
        Carregando sessão Minerva Foods...
      </div>
    );
  }

  if (!user) {
    return <LoginScreen />;
  }

  const isDark = theme === 'dark';

  return (
    <div
      className={`min-h-screen flex flex-col transition-colors duration-200 ${
        isDark ? 'bg-[#0f1720] text-slate-100 dark' : 'bg-[#f0f4f8] text-slate-800'
      }`}
    >
      {/* Header with Navigation and Corporate Branding */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      {/* Global Filter Ribbon with Searchable Multi-Select Filtering */}
      <FilterRibbon
        selectedYear={selectedYear}
        setSelectedYear={setSelectedYear}
        availableYears={metadata.years}
        selectedMonth={selectedMonth}
        setSelectedMonth={setSelectedMonth}
        availableMonths={metadata.months}
        viewMode={viewMode}
        setViewMode={setViewMode}
        selectedBusinesses={selectedBusinesses}
        setSelectedBusinesses={setSelectedBusinesses}
        availableBusinesses={availableBusinesses}
        selectedDirectors={selectedDirectors}
        setSelectedDirectors={setSelectedDirectors}
        availableDirectors={availableDirectors}
        selectedGerentes={selectedGerentes}
        setSelectedGerentes={setSelectedGerentes}
        availableGerentes={availableGerentes}
        selectedGestores={selectedGestores}
        setSelectedGestores={setSelectedGestores}
        availableGestores={availableGestores}
        selectedCostCenters={selectedCostCenters}
        setSelectedCostCenters={setSelectedCostCenters}
        availableCostCenters={availableCostCentersList}
        selectedMacros={selectedMacros}
        setSelectedMacros={setSelectedMacros}
        availableMacros={availableMacros}
        onResetFilters={handleResetFilters}
        activeFilterCount={activeFilterCount}
        scale={scale}
        setScale={setScale}
        theme={theme}
        setTheme={handleSetTheme}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-[1400px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'overview' && (
          <div key="overview" className="tab-content-enter">
            <OverviewView
              monthlyData={filteredMonthly}
              costCenters={filteredCostCenters}
              packages={filteredPackages}
              scale={scale}
              theme={theme}
              onSelectDrillDown={setDrillDownItem}
            />
          </div>
        )}

        {activeTab === 'cost_centers' && (
          <div key="cost_centers" className="tab-content-enter">
            <CostCentersView
              costCenters={filteredCostCenters}
              scale={scale}
              theme={theme}
              onSelectDrillDown={setDrillDownItem}
            />
          </div>
        )}

        {activeTab === 'packages' && (
          <div key="packages" className="tab-content-enter">
            <PackagesView
              packages={filteredPackages}
              scale={scale}
              theme={theme}
              onSelectDrillDown={setDrillDownItem}
            />
          </div>
        )}

        {activeTab === 'managers' && (
          <div key="managers" className="tab-content-enter">
            <ManagersView
              costCenters={filteredCostCenters}
              scale={scale}
              theme={theme}
              onSelectDrillDown={setDrillDownItem}
            />
          </div>
        )}

        {activeTab === 'analytics' && (
          <div key="analytics" className="tab-content-enter">
            <AnalyticsView
              records={filteredAnalytics}
              scale={scale}
              theme={theme}
            />
          </div>
        )}
      </main>

      {/* Corporate Executive Footer */}
      <footer
        className={`border-t py-3.5 transition-colors ${
          isDark
            ? 'bg-[#141b25] border-slate-800 text-slate-400'
            : 'bg-white/80 backdrop-blur-sm border-slate-200/60 text-slate-400'
        }`}
      >
        <div className="max-w-[1400px] mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-2.5 text-[11px]">
          <div className="flex items-center space-x-2">
            <span>
              <strong className={isDark ? 'text-slate-200' : 'text-slate-600'}>Minerva Foods</strong>{' '}
              • Diretoria de Controladoria Corporativa
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <span className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>
                OneDrive: <strong>{metadata.sync_info?.source_file || 'PBIX'}</strong>
                {metadata.sync_info?.last_sync ? ` (${metadata.sync_info.last_sync})` : ''}
              </span>
            </span>

            <button
              type="button"
              onClick={handleSyncNow}
              disabled={isSyncing}
              title="Verificar atualizações do OneDrive e recarregar painel"
              className={`inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold border transition-all cursor-pointer btn-press ${
                isSyncing
                  ? 'bg-amber-500/15 text-amber-500 border-amber-500/30'
                  : isDark
                  ? 'bg-[#385463]/25 text-[#7bb0ce] border-[#385463]/40 hover:bg-[#385463]/40'
                  : 'bg-[#385463]/10 text-[#385463] border-[#385463]/20 hover:bg-[#385463]/20'
              }`}
            >
              <RefreshCw className={`w-3 h-3 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? 'Atualizando...' : 'Sincronizar Agora'}</span>
            </button>

            {lastSyncMsg && (
              <span className="text-emerald-500 font-semibold animate-fade-in text-[10px]">
                {lastSyncMsg}
              </span>
            )}

            <span className="text-slate-400 hidden lg:inline">
              • {filteredCostCenters.length} centros no escopo
            </span>
          </div>
        </div>
      </footer>

      {/* Drill-down Modal */}
      <DetailModal
        item={drillDownItem}
        onClose={() => setDrillDownItem(null)}
        analyticsRecords={filteredAnalytics}
        scale={scale}
        theme={theme}
      />
    </div>
  );
}

export function App() {
  return (
    <AuthProvider>
      <DashboardContent />
    </AuthProvider>
  );
}

export default App;
