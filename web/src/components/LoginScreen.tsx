import React, { useState } from 'react';
import { ShieldCheck, ArrowRight, AlertCircle } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

export const LoginScreen: React.FC = () => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const res = login(email);
    if (!res.success) {
      setError(res.message || 'Falha ao autenticar.');
    }
  };

  const handleQuickLogin = (targetEmail: string) => {
    setEmail(targetEmail);
    setError(null);
    login(targetEmail);
  };

  return (
    <div className="min-h-screen bg-[#1c2630] flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden">
      {/* Background Subtle Gradient Blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-[#385463]/20 blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-[#e84752]/10 blur-3xl pointer-events-none" />

      {/* Main Card */}
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden relative z-10">
        {/* Top Header Card */}
        <div className="bg-[#24303b] p-8 text-center border-b border-[#385463] relative">
          <div className="flex justify-center mb-4">
            <img
              src="/logo-minerva-light.svg"
              alt="Minerva Foods"
              className="h-12 w-auto object-contain"
            />
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">Portal GGO Digital</h2>
          <p className="text-xs text-slate-300 mt-1">
            Gestão de Gastos Operacionais • Acesso Restrito por RLS
          </p>
        </div>

        {/* Login Body */}
        <div className="p-8 space-y-6">
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start space-x-2.5">
              <AlertCircle className="w-4 h-4 text-rose-600 mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                E-mail Corporativo
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  placeholder="seu.nome@minervafoods.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#385463] focus:bg-white transition-all font-medium"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 px-4 bg-[#24303b] hover:bg-[#1a232b] text-white text-xs font-bold rounded-lg shadow-sm transition-all flex items-center justify-center space-x-2 cursor-pointer"
            >
              <span>Acessar Painel GGO</span>
              <ArrowRight className="w-4 h-4 text-[#e84752]" />
            </button>
          </form>

          {/* Microsoft SSO Button */}
          <div className="pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => handleQuickLogin('maria.almeida@minervafoods.com')}
              className="w-full py-2.5 px-4 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-all flex items-center justify-center space-x-2 cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Entrar com Microsoft Entra ID (SSO Minerva)</span>
            </button>
          </div>

          {/* Quick Select for Testing Authorized Roles */}
          <div className="pt-2">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 text-center">
              Acesso Rápido para Validação de Perfis RLS
            </p>
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <button
                type="button"
                onClick={() => handleQuickLogin('maria.almeida@minervafoods.com')}
                className="p-2 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-left transition-colors cursor-pointer"
              >
                <div className="font-bold text-slate-800">Maria Almeida</div>
                <div className="text-[10px] text-emerald-700 font-semibold">Admin (Total)</div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('emerson.silveira@minervafoods.com')}
                className="p-2 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-left transition-colors cursor-pointer"
              >
                <div className="font-bold text-slate-800">Emerson Silveira</div>
                <div className="text-[10px] text-amber-700 font-semibold">Gestor (RLS Ativo)</div>
              </button>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="bg-slate-50 p-4 border-t border-slate-100 text-center text-[10px] text-slate-400">
          Uso restrito e confidencial • Minerva S.A.
        </div>
      </div>
    </div>
  );
};
