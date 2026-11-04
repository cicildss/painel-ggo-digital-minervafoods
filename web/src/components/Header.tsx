import React from 'react';
import { DollarSign, BarChart3, TrendingUp, Layers, Database, LogOut, ShieldCheck, Lock } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

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
  const { user, logout } = useAuth();

  const tabs = [
    { id: 'overview', label: 'Cockpit Executivo', icon: TrendingUp },
    { id: 'cost_centers', label: 'Centros de Custo', icon: BarChart3 },
    { id: 'packages', label: 'Pacotes de Gastos', icon: Layers },
    { id: 'analytics', label: 'Base Analítica & Auditoria', icon: Database },
  ];

  return (
    <header className="bg-[#1c2630] text-white shadow-lg border-b border-[#2b3d4a]">
      {/* Top Corporate Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Brand & Logo */}
        <div className="flex items-center space-x-4">
          <div className="bg-white/5 p-1.5 rounded-lg border border-white/10 hover:border-white/20 transition-all flex items-center justify-center">
            <img
              src="/logo-minerva-light.svg"
              alt="Minerva Foods"
              className="h-8 w-auto object-contain"
            />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-base font-extrabold tracking-tight text-white uppercase">
                GGO Digital
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#385463] text-[#e3e0b0] border border-[#e3e0b0]/30 tracking-wider">
                Controladoria
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium">
              Acompanhamento Estratégico de Gastos Operacionais
            </p>
          </div>
        </div>

        {/* Right Section: Global Controls + Real User Profile */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Year selector & Scale Switcher */}
          <div className="flex items-center space-x-2 bg-[#24303b] px-3 py-1.5 rounded-lg border border-[#385463]/50">
            {/* Year selector */}
            <div className="flex items-center space-x-1.5 text-xs text-slate-300 font-medium border-r border-[#385463]/80 pr-2.5">
              <span className="text-slate-400 text-[11px]">Ano:</span>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                className="bg-[#1c2630] text-white rounded px-2 py-0.5 text-xs font-bold border border-[#385463] focus:outline-none focus:ring-1 focus:ring-[#e84752]"
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
              <span className="text-[11px] text-slate-400 font-medium mr-0.5 flex items-center">
                <DollarSign className="w-3.5 h-3.5 text-[#e3e0b0]" />
              </span>
              <button
                onClick={() => setScale('BRL')}
                className={`px-2 py-0.5 text-[11px] rounded font-semibold transition-all cursor-pointer ${
                  scale === 'BRL'
                    ? 'bg-[#e84752] text-white shadow-xs'
                    : 'text-slate-400 hover:text-white hover:bg-[#2b3d4a]'
                }`}
              >
                R$
              </button>
              <button
                onClick={() => setScale('BRL_1000')}
                className={`px-2 py-0.5 text-[11px] rounded font-semibold transition-all cursor-pointer ${
                  scale === 'BRL_1000'
                    ? 'bg-[#e84752] text-white shadow-xs'
                    : 'text-slate-400 hover:text-white hover:bg-[#2b3d4a]'
                }`}
              >
                R$ Mil
              </button>
            </div>
          </div>

          {/* Real Authenticated User Profile */}
          {user && (
            <div className="flex items-center space-x-3 bg-[#24303b] pl-3 pr-2 py-1.5 rounded-lg border border-[#385463]/50">
              <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-[#385463] to-[#e84752] flex items-center justify-center font-bold text-xs text-white shadow-xs">
                {user.name.charAt(0)}
              </div>
              <div className="text-left hidden sm:block">
                <div className="text-xs font-bold text-white flex items-center space-x-1.5">
                  <span className="truncate max-w-[140px]">{user.name}</span>
                  {user.hasFullAccess ? (
                    <span className="inline-flex items-center px-1.5 py-0.2 rounded text-[9px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      <ShieldCheck className="w-2.5 h-2.5 mr-0.5" />
                      ADMIN
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-1.5 py-0.2 rounded text-[9px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      <Lock className="w-2.5 h-2.5 mr-0.5" />
                      {user.costCenters.length} CCs
                    </span>
                  )}
                </div>
                <div className="text-[10px] text-slate-400 truncate max-w-[150px]">{user.email}</div>
              </div>

              {/* Logout Button */}
              <button
                onClick={logout}
                title="Sair / Encerrar Sessão"
                className="p-1.5 rounded text-slate-400 hover:text-white hover:bg-[#e84752]/20 hover:border-[#e84752]/40 transition-colors border border-transparent cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex space-x-2 overflow-x-auto border-t border-[#2b3d4a]/60">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 py-2.5 px-4 text-xs font-bold border-b-2 transition-all whitespace-nowrap cursor-pointer ${
                isActive
                  ? 'border-[#e84752] text-white bg-white/5'
                  : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-white/5'
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
