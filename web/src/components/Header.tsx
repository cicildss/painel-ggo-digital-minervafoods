import React from 'react';
import { DollarSign, BarChart3, TrendingUp, Layers, Database } from 'lucide-react';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  scale: 'BRL' | 'BRL_1000';
  setScale: (scale: 'BRL' | 'BRL_1000') => void;
  selectedYear: number;
  setSelectedYear: (year: number) => void;
  availableYears: number[];
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  scale,
  setScale,
  selectedYear,
  setSelectedYear,
  availableYears
}) => {
  const tabs = [
    { id: 'overview', label: 'Visão Geral', icon: TrendingUp },
    { id: 'cost_centers', label: 'Centros de Custo', icon: BarChart3 },
    { id: 'packages', label: 'Pacotes de Gastos', icon: Layers },
    { id: 'analytics', label: 'Base Analítica', icon: Database },
  ];

  return (
    <header className="bg-[#24303b] text-white shadow-md border-b border-[#385463]">
      {/* Top Corporate Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Brand & Title */}
        <div className="flex items-center space-x-3.5">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#e84752] to-[#bf404d] flex items-center justify-center font-bold text-lg text-white shadow-sm ring-2 ring-white/20">
            M
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xl font-bold tracking-tight text-white">MINERVA FOODS</span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-[#385463] text-[#e3e0b0] border border-[#e3e0b0]/30 uppercase tracking-wider">
                GGO Digital
              </span>
            </div>
            <p className="text-xs text-slate-300 font-medium">
              Gestão e Acompanhamento de Gastos Operacionais
            </p>
          </div>
        </div>

        {/* Global Controls: Year + Monetary Scale */}
        <div className="flex items-center space-x-3 bg-[#1e2932] px-3 py-1.5 rounded-lg border border-[#385463]/60">
          {/* Year selector */}
          <div className="flex items-center space-x-1.5 text-xs text-slate-300 font-medium border-r border-[#385463] pr-3">
            <span>Ano:</span>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="bg-[#24303b] text-white rounded px-2 py-1 text-xs font-semibold border border-[#385463] focus:outline-none focus:ring-1 focus:ring-[#e84752]"
            >
              {availableYears.map((yr) => (
                <option key={yr} value={yr}>
                  {yr}
                </option>
              ))}
            </select>
          </div>

          {/* Scale Switcher: BRL vs BRL / 1000 */}
          <div className="flex items-center space-x-1">
            <span className="text-xs text-slate-300 font-medium mr-1 flex items-center">
              <DollarSign className="w-3.5 h-3.5 text-[#e3e0b0] mr-0.5" />
              Escala:
            </span>
            <button
              onClick={() => setScale('BRL')}
              className={`px-2.5 py-1 text-xs rounded font-medium transition-all ${
                scale === 'BRL'
                  ? 'bg-[#e84752] text-white shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-[#2b3d4a]'
              }`}
            >
              R$ (Real)
            </button>
            <button
              onClick={() => setScale('BRL_1000')}
              className={`px-2.5 py-1 text-xs rounded font-medium transition-all ${
                scale === 'BRL_1000'
                  ? 'bg-[#e84752] text-white shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-[#2b3d4a]'
              }`}
            >
              R$ Mil
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex space-x-1 overflow-x-auto border-t border-[#385463]/40">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 py-2.5 px-4 text-xs font-semibold border-b-2 transition-all whitespace-nowrap ${
                isActive
                  ? 'border-[#e84752] text-white bg-[#2b3d4a]/50'
                  : 'border-transparent text-slate-300 hover:text-white hover:bg-[#2b3d4a]/20'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-[#e84752]' : 'text-slate-400'}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>
    </header>
  );
};
