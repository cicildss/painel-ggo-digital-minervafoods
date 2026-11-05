import React from 'react';
import {
  BarChart3,
  TrendingUp,
  Layers,
  Database,
  LogOut,
  ShieldCheck,
  Lock,
  Calendar
} from 'lucide-react';
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
    <header className="bg-[#1c2630] text-white sticky top-0 z-50 shadow-md border-b border-[#2b3d4a]">
      {/* Top Corporate Control Bar */}
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand identity */}
        <div className="flex items-center space-x-3 sm:space-x-4">
          <div className="flex items-center justify-center p-1 rounded-lg bg-white/5 border border-white/10">
            <img
              src="/logo-minerva-light.svg"
              alt="Minerva Foods"
              className="h-7 sm:h-8 w-auto object-contain"
            />
          </div>
          <div className="hidden sm:block h-7 w-px bg-white/10" />
          <div className="hidden sm:block">
            <div className="flex items-center space-x-2">
              <span className="text-sm font-bold tracking-tight text-white uppercase">
                GGO Digital
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#385463] text-[#e3e0b0] border border-[#e3e0b0]/30 tracking-wider">
                Controladoria
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-medium">
              Gestão e Monitoramento de Gastos Operacionais
            </p>
          </div>
        </div>

        {/* Global Controls & User Profile */}
        <div className="flex items-center space-x-2.5 sm:space-x-3">
          {/* Year selector */}
          <div className="flex items-center space-x-1.5 bg-[#24303b] px-2.5 py-1.5 rounded-lg border border-[#385463]/40 text-xs font-medium">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-400 text-[11px] hidden xs:inline">Ano:</span>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="bg-transparent text-white font-bold text-xs focus:outline-none cursor-pointer"
            >
              {availableYears.map((yr) => (
                <option key={yr} value={yr} className="bg-[#1c2630] text-white">
                  {yr}
                </option>
              ))}
            </select>
          </div>

          {/* Scale switch */}
          <div className="flex items-center bg-[#24303b] p-1 rounded-lg border border-[#385463]/40">
            <button
              type="button"
              onClick={() => setScale('BRL')}
              className={`px-2 py-1 text-[11px] rounded font-semibold transition-all cursor-pointer ${
                scale === 'BRL'
                  ? 'bg-[#e84752] text-white shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              R$
            </button>
            <button
              type="button"
              onClick={() => setScale('BRL_1000')}
              className={`px-2 py-1 text-[11px] rounded font-semibold transition-all cursor-pointer ${
                scale === 'BRL_1000'
                  ? 'bg-[#e84752] text-white shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              R$ Mil
            </button>
          </div>

          <div className="h-6 w-px bg-white/10 hidden sm:block" />

          {/* User Profile */}
          {user && (
            <div className="flex items-center space-x-2.5 bg-[#24303b] pl-2.5 pr-1.5 py-1 rounded-lg border border-[#385463]/40">
              <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-[#385463] to-[#e84752] flex items-center justify-center font-bold text-xs text-white shadow-xs">
                {user.name.charAt(0)}
              </div>
              <div className="text-left hidden md:block">
                <div className="text-xs font-bold text-white flex items-center space-x-1.5">
                  <span className="truncate max-w-[130px]">{user.name}</span>
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
                <div className="text-[10px] text-slate-400 truncate max-w-[140px]">
                  {user.email}
                </div>
              </div>

              <button
                type="button"
                onClick={logout}
                title="Sair / Encerrar Sessão"
                className="p-1.5 rounded-md text-slate-400 hover:text-white hover:bg-rose-500/20 transition-all cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Row 2: Navigation tabs with sleek active underline */}
      <div className="border-t border-[#2b3d4a]/70 bg-[#17202a]">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 flex space-x-1 sm:space-x-2 overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`group flex items-center space-x-2 py-2.5 px-3.5 text-xs font-semibold relative transition-all whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'text-white font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Icon
                  className={`w-4 h-4 transition-colors ${
                    isActive ? 'text-[#e84752]' : 'text-slate-400 group-hover:text-slate-300'
                  }`}
                />
                <span>{tab.label}</span>
                {isActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-[#e84752] rounded-t-full shadow-sm" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
