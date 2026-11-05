import { useState, useMemo, useEffect } from 'react';
import { AuthProvider } from './context/AuthContext';
import { useAuth } from './hooks/useAuth';
import { LoginScreen } from './components/LoginScreen';
import { Header } from './components/Header';
import { FilterRibbon } from './components/FilterRibbon';
import { OverviewView } from './components/OverviewView';
import { CostCentersView } from './components/CostCentersView';
import { PackagesView } from './components/PackagesView';
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
  const [selectedMacro, setSelectedMacro] = useState<string>('ALL');
  const [drillDownItem, setDrillDownItem] = useState<DrillDownItem | null>(null);

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

  // Macroareas list
  const availableMacros = useMemo(() => {
    const set = new Set(initialCostCenters.map((c) => c.macroarea).filter(Boolean));
    return Array.from(set).sort();
  }, [initialCostCenters]);

  const isUserAdmin = user?.hasFullAccess ?? false;
  const userAllowedCCs = user?.costCenters ?? [];

  // Filtered Cost Centers (RLS + Macroarea)
  const filteredCostCenters = useMemo(() => {
    let result = initialCostCenters;
    if (!isUserAdmin) {
      result = result.filter((cc) => userAllowedCCs.includes(cc.code));
    }
    if (selectedMacro !== 'ALL') {
      result = result.filter((cc) => cc.macroarea === selectedMacro);
    }
    return result;
  }, [isUserAdmin, userAllowedCCs, initialCostCenters, selectedMacro]);

  // Filtered Analytics (RLS + Macroarea)
  const filteredAnalytics = useMemo(() => {
    let result = initialAnalytics;
    if (!isUserAdmin) {
      result = result.filter((r) => userAllowedCCs.includes(r.centro_custo));
    }
    if (selectedMacro !== 'ALL') {
      result = result.filter((r) => r.macroarea === selectedMacro);
    }
    return result;
  }, [isUserAdmin, userAllowedCCs, initialAnalytics, selectedMacro]);

  // Filtered Monthly Summary (Year + Month/YTD + Macroarea Factor)
  const filteredMonthly = useMemo(() => {
    let yearRecords = initialMonthly.filter((m) => m.year === selectedYear);

    // Apply month filtering
    if (selectedMonth !== 'ALL') {
      if (viewMode === 'MONTH') {
        yearRecords = yearRecords.filter((m) => m.month === selectedMonth);
      } else {
        // YTD: up to selected month
        yearRecords = yearRecords.filter((m) => m.month <= (selectedMonth as number));
      }
    }

    // Macroarea or gestor proportion factor
    const totalAllCCReal = initialCostCenters.reduce((acc, c) => acc + c.realizado, 0);
    const activeCCReal = filteredCostCenters.reduce((acc, c) => acc + c.realizado, 0);
    const factor = totalAllCCReal > 0 && (!isUserAdmin || selectedMacro !== 'ALL')
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
    selectedMacro,
    initialMonthly,
    initialCostCenters,
    filteredCostCenters
  ]);

  // Filtered Packages
  const filteredPackages = useMemo(() => {
    const totalAllCCReal = initialCostCenters.reduce((acc, c) => acc + c.realizado, 0);
    const activeCCReal = filteredCostCenters.reduce((acc, c) => acc + c.realizado, 0);
    const factor = totalAllCCReal > 0 && (!isUserAdmin || selectedMacro !== 'ALL')
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
  }, [isUserAdmin, selectedMacro, initialPackages, initialCostCenters, filteredCostCenters]);

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

      {/* Global Filter Ribbon (Year, Month, YTD/Month, Macroarea, Scale, Theme) */}
      <FilterRibbon
        selectedYear={selectedYear}
        setSelectedYear={setSelectedYear}
        availableYears={metadata.years}
        selectedMonth={selectedMonth}
        setSelectedMonth={setSelectedMonth}
        availableMonths={metadata.months}
        viewMode={viewMode}
        setViewMode={setViewMode}
        selectedMacro={selectedMacro}
        setSelectedMacro={setSelectedMacro}
        availableMacros={availableMacros}
        scale={scale}
        setScale={setScale}
        theme={theme}
        setTheme={handleSetTheme}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-[1400px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'overview' && (
          <OverviewView
            monthlyData={filteredMonthly}
            costCenters={filteredCostCenters}
            packages={filteredPackages}
            scale={scale}
            theme={theme}
            onSelectDrillDown={setDrillDownItem}
          />
        )}

        {activeTab === 'cost_centers' && (
          <CostCentersView
            costCenters={filteredCostCenters}
            scale={scale}
            theme={theme}
            onSelectDrillDown={setDrillDownItem}
          />
        )}

        {activeTab === 'packages' && (
          <PackagesView
            packages={filteredPackages}
            scale={scale}
            theme={theme}
            onSelectDrillDown={setDrillDownItem}
          />
        )}

        {activeTab === 'analytics' && (
          <AnalyticsView
            records={filteredAnalytics}
            scale={scale}
            theme={theme}
          />
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
        <div className="max-w-[1400px] mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-1 text-[11px]">
          <span>
            <strong className={isDark ? 'text-slate-200' : 'text-slate-600'}>Minerva Foods</strong>{' '}
            • Diretoria de Controladoria Corporativa
          </span>
          <span>Painel GGO Digital • Segurança RLS Ativa • Dados sincronizados com DW Minerva</span>
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
