import React from 'react';
import { ShieldCheck, UserCheck, Lock, Building2 } from 'lucide-react';
import type { Gestor } from '../types';

interface RLSBarProps {
  currentUserEmail: string;
  setCurrentUserEmail: (email: string) => void;
  admins: string[];
  gestores: Gestor[];
  activeCostCenters: string[];
}

export const RLSBar: React.FC<RLSBarProps> = ({
  currentUserEmail,
  setCurrentUserEmail,
  admins,
  gestores,
  activeCostCenters
}) => {
  const isAdmin = admins.includes(currentUserEmail.toLowerCase());

  return (
    <div className="bg-[#f1f5f9] border-b border-slate-200 px-4 sm:px-6 lg:px-8 py-2.5">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-xs">
        {/* RLS Status Badge */}
        <div className="flex items-center space-x-2">
          <div
            className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-full font-semibold ${
              isAdmin
                ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                : 'bg-amber-100 text-amber-800 border border-amber-300'
            }`}
          >
            {isAdmin ? (
              <>
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Perfil: ADMIN CONTROLADORIA (Acesso Irrestrito)</span>
              </>
            ) : (
              <>
                <Lock className="w-3.5 h-3.5 text-amber-600" />
                <span>Perfil: GESTOR DE CENTRO DE CUSTO (RLS Ativo)</span>
              </>
            )}
          </div>

          <div className="text-slate-500 font-medium hidden sm:flex items-center space-x-1">
            <Building2 className="w-3.5 h-3.5 text-slate-400" />
            <span>
              {isAdmin
                ? 'Todos os Centros de Custo visíveis'
                : `${activeCostCenters.length} centro(s) liberado(s)`}
            </span>
          </div>
        </div>

        {/* User Switcher Dropdown */}
        <div className="flex items-center space-x-2 w-full md:w-auto">
          <span className="text-slate-600 font-medium whitespace-nowrap flex items-center">
            <UserCheck className="w-3.5 h-3.5 mr-1 text-[#385463]" />
            Simular Usuário:
          </span>
          <select
            value={currentUserEmail}
            onChange={(e) => setCurrentUserEmail(e.target.value)}
            className="w-full md:w-80 bg-white text-slate-800 border border-slate-300 rounded px-2.5 py-1 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#385463]"
          >
            <optgroup label="👑 Administradores (Acesso Total)">
              {admins.map((adm) => (
                <option key={adm} value={adm}>
                  {adm} (Admin)
                </option>
              ))}
            </optgroup>
            <optgroup label="👤 Gestores com RLS (Filtro por Centro de Custo)">
              {gestores.map((g) => (
                <option key={g.email} value={g.email}>
                  {g.name || g.email} ({g.cost_centers.length} CCs)
                </option>
              ))}
            </optgroup>
          </select>
        </div>
      </div>
    </div>
  );
};
