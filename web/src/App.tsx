import { useState, useMemo } from 'react';
import { Header } from './components/Header';
import { RLSBar } from './components/RLSBar';
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

export function App() {
  const metadata = metadataData as unknown as Metadata;
  const initialMonthly = monthlyDataRaw as unknown as MonthlyRecord[];
  const initialCostCenters = costCentersRaw as unknown as CostCenterRecord[];
  const initialPackages = packagesRaw as unknown as PackageRecord[];
  const initialAnalytics = analyticsRaw as unknown as AnalyticsRecord[];

  // App State
  const [currentUserEmail, setCurrentUserEmail] = useState<string>('maria.almeida@minervafoods.com');
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [scale, setScale] = useState<'BRL' | 'BRL_1000'>('BRL_1000');
  const [selectedYear, setSelectedYear] = useState<number>(
    metadata.years.length > 0 ? metadata.years[metadata.years.length - 1] : 2026
  );

  // Check RLS Admin status
  const isAdmin = useMemo(() => {
    return metadata.admins.map((a) => a.toLowerCase()).includes(currentUserEmail.toLowerCase());
  }, [currentUserEmail, metadata.admins]);

  // Gestor's authorized Cost Centers
  const activeCostCenters = useMemo(() => {
    if (isAdmin) {
      return initialCostCenters.map((cc) => cc.code);
    }
    const gestor = metadata.gestores.find(
      (g) => g.email.toLowerCase() === currentUserEmail.toLowerCase()
    );
    return gestor ? gestor.cost_centers : [];
  }, [isAdmin, currentUserEmail, metadata.gestores, initialCostCenters]);

  // RLS-filtered Cost Centers
  const filteredCostCenters = useMemo(() => {
    if (isAdmin) return initialCostCenters;
    return initialCostCenters.filter((cc) => activeCostCenters.includes(cc.code));
  }, [isAdmin, activeCostCenters, initialCostCenters]);

  // RLS-filtered Analytics
  const filteredAnalytics = useMemo(() => {
    if (isAdmin) return initialAnalytics;
    return initialAnalytics.filter((r) => activeCostCenters.includes(r.centro_custo));
  }, [isAdmin, activeCostCenters, initialAnalytics]);

  // RLS-adjusted Monthly Summary
  const filteredMonthly = useMemo(() => {
    const yearFiltered = initialMonthly.filter((m) => m.year === selectedYear);
    if (isAdmin) return yearFiltered;

    // Proportionally scale or calculate from filtered cost centers
    const totalAllCCReal = initialCostCenters.reduce((acc, c) => acc + c.realizado, 0);
    const gestorCCReal = filteredCostCenters.reduce((acc, c) => acc + c.realizado, 0);
    const factor = totalAllCCReal > 0 ? gestorCCReal / totalAllCCReal : 1;

    return yearFiltered.map((m) => {
      const orc = m.orcado * factor;
      const real = m.realizado * factor;
      const desv = real - orc;
      const desvPct = orc > 0 ? (desv / orc) * 100 : 0;
      return {
        ...m,
        orcado: orc,
        realizado: real,
        desvio: desv,
        desvio_pct: desvPct,
      };
    });
  }, [isAdmin, selectedYear, initialMonthly, initialCostCenters, filteredCostCenters]);

  // RLS-adjusted Packages
  const filteredPackages = useMemo(() => {
    if (isAdmin) return initialPackages;
    const totalAllCCReal = initialCostCenters.reduce((acc, c) => acc + c.realizado, 0);
    const gestorCCReal = filteredCostCenters.reduce((acc, c) => acc + c.realizado, 0);
    const factor = totalAllCCReal > 0 ? gestorCCReal / totalAllCCReal : 1;

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
        desvio_pct: desvPct,
      };
    });
  }, [isAdmin, initialPackages, initialCostCenters, filteredCostCenters]);

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 flex flex-col">
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

      {/* RLS Security Bar & Profile Switcher */}
      <RLSBar
        currentUserEmail={currentUserEmail}
        setCurrentUserEmail={setCurrentUserEmail}
        admins={metadata.admins}
        gestores={metadata.gestores}
        activeCostCenters={activeCostCenters}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
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

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>Minerva Foods © 2026 • Diretoria de Controladoria Corporativa</span>
          <span className="text-slate-400">
            Painel GGO Digital • Dados sincronizados com DW Minerva e SAP CSKS/CSKT
          </span>
        </div>
      </footer>
    </div>
  );
}

export default App;
