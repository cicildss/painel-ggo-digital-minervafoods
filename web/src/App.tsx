import { useState, useMemo } from 'react';
import { AuthProvider } from './context/AuthContext';
import { useAuth } from './hooks/useAuth';
import { LoginScreen } from './components/LoginScreen';
import { Header } from './components/Header';
import { OverviewView } from './components/OverviewView';
import { CostCentersView } from './components/CostCentersView';
import { PackagesView } from './components/PackagesView';
import { AnalyticsView } from './components/AnalyticsView';

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

  // App State — ALL hooks must come before any conditional return
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [scale, setScale] = useState<'BRL' | 'BRL_1000'>('BRL_1000');
  const [selectedYear, setSelectedYear] = useState<number>(
    metadata.years.length > 0 ? metadata.years[metadata.years.length - 1] : 2026
  );

  const isUserAdmin = user?.hasFullAccess ?? false;
  const userAllowedCCs = user?.costCenters ?? [];

  // All useMemo hooks BEFORE any early return
  const filteredCostCenters = useMemo(() => {
    if (isUserAdmin) return initialCostCenters;
    return initialCostCenters.filter((cc) => userAllowedCCs.includes(cc.code));
  }, [isUserAdmin, userAllowedCCs, initialCostCenters]);

  const filteredAnalytics = useMemo(() => {
    if (isUserAdmin) return initialAnalytics;
    return initialAnalytics.filter((r) => userAllowedCCs.includes(r.centro_custo));
  }, [isUserAdmin, userAllowedCCs, initialAnalytics]);

  const filteredMonthly = useMemo(() => {
    const yearFiltered = initialMonthly.filter((m) => m.year === selectedYear);
    if (isUserAdmin) return yearFiltered;

    const totalAllCCReal = initialCostCenters.reduce((acc, c) => acc + c.realizado, 0);
    const gestorCCReal = filteredCostCenters.reduce((acc, c) => acc + c.realizado, 0);
    const factor = totalAllCCReal > 0 ? gestorCCReal / totalAllCCReal : 1;

    return yearFiltered.map((m) => {
      const orc = m.orcado * factor;
      const real = m.realizado * factor;
      const desv = real - orc;
      const desvPct = orc > 0 ? (desv / orc) * 100 : 0;
      return { ...m, orcado: orc, realizado: real, desvio: desv, desvio_pct: desvPct };
    });
  }, [isUserAdmin, selectedYear, initialMonthly, initialCostCenters, filteredCostCenters]);

  const filteredPackages = useMemo(() => {
    if (isUserAdmin) return initialPackages;
    const totalAllCCReal = initialCostCenters.reduce((acc, c) => acc + c.realizado, 0);
    const gestorCCReal = filteredCostCenters.reduce((acc, c) => acc + c.realizado, 0);
    const factor = totalAllCCReal > 0 ? gestorCCReal / totalAllCCReal : 1;

    return initialPackages.map((p) => {
      const orc = p.orcado * factor;
      const real = p.realizado * factor;
      const desv = real - orc;
      const desvPct = orc > 0 ? (desv / orc) * 100 : 0;
      return { ...p, orcado: orc, realizado: real, desvio: desv, desvio_pct: desvPct };
    });
  }, [isUserAdmin, initialPackages, initialCostCenters, filteredCostCenters]);

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

  return (
    <div className="min-h-screen bg-[#f0f4f8] text-slate-800 flex flex-col">
      {/* Header with Navigation and Corporate Branding */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        scale={scale}
        setScale={setScale}
        selectedYear={selectedYear}
        setSelectedYear={setSelectedYear}
        availableYears={metadata.years}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-[1400px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'overview' && (
          <OverviewView
            monthlyData={filteredMonthly}
            costCenters={filteredCostCenters}
            packages={filteredPackages}
            scale={scale}
          />
        )}

        {activeTab === 'cost_centers' && (
          <CostCentersView costCenters={filteredCostCenters} scale={scale} />
        )}

        {activeTab === 'packages' && (
          <PackagesView packages={filteredPackages} scale={scale} />
        )}

        {activeTab === 'analytics' && (
          <AnalyticsView records={filteredAnalytics} scale={scale} />
        )}
      </main>

      {/* Corporate Executive Footer */}
      <footer className="bg-white/80 backdrop-blur-sm border-t border-slate-200/60 py-3">
        <div className="max-w-[1400px] mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-1 text-[11px] text-slate-400">
          <span><strong className="text-slate-600">Minerva Foods</strong> • Diretoria de Controladoria Corporativa</span>
          <span>Painel GGO Digital • Segurança RLS Ativa • Dados sincronizados com DW Minerva</span>
        </div>
      </footer>
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
