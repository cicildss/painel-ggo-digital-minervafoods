import React, { useState } from 'react';
import { Shield, Mail, ArrowRight, AlertCircle, Lock } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

export const LoginScreen: React.FC = () => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    setTimeout(() => {
      const res = login(email);
      if (!res.success) {
        setError(res.message || 'Falha ao autenticar no portal.');
      }
      setIsSubmitting(false);
    }, 250);
  };

  const handleSsoLogin = () => {
    setError(null);
    setIsSubmitting(true);
    setTimeout(() => {
      const res = login('maria.almeida@minervafoods.com');
      if (!res.success) {
        setError(res.message || 'Falha ao autenticar via SSO.');
      }
      setIsSubmitting(false);
    }, 250);
  };

  return (
    <div className="min-h-screen bg-[#1c2630] flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden font-sans">
      {/* Background ambient lighting */}
      <div className="absolute top-[-15%] left-[-10%] w-[650px] h-[650px] rounded-full bg-[#385463]/20 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-15%] right-[-10%] w-[650px] h-[650px] rounded-full bg-[#e84752]/10 blur-[130px] pointer-events-none" />
      <div className="absolute top-[40%] right-[20%] w-[350px] h-[350px] rounded-full bg-[#e3e0b0]/5 blur-[100px] pointer-events-none" />

      {/* Brand logo header */}
      <div className="mb-6 flex flex-col items-center animate-fade-in z-10">
        <img
          src="/logo-minerva-light.svg"
          alt="Minerva Foods"
          className="h-12 w-auto object-contain drop-shadow-md"
        />
      </div>

      {/* Card */}
      <div className="w-full max-w-[430px] bg-white/[0.04] backdrop-blur-2xl rounded-2xl border border-white/10 shadow-2xl overflow-hidden relative z-10 animate-slide-up">
        <div className="p-8">
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-11 h-11 rounded-xl bg-[#e84752]/15 border border-[#e84752]/20 mb-3 text-[#e84752]">
              <Shield className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight">Painel GGO Digital</h2>
            <p className="text-xs text-slate-400 mt-1">
              Gestão de Gastos Operacionais • Controladoria Corporativa
            </p>
            <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/5 border border-white/10 text-[10px] text-slate-300 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Segurança RLS Ativa (Row-Level Security)
            </div>
          </div>

          {error && (
            <div className="mb-5 p-3.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-200 text-xs flex items-start space-x-2.5">
              <AlertCircle className="w-4 h-4 text-rose-400 mt-0.5 shrink-0" />
              <span className="leading-relaxed">{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                E-mail Corporativo
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  required
                  placeholder="usuario@minervafoods.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 text-xs bg-white/5 border border-white/15 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#e84752]/50 focus:border-transparent transition-all font-medium"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 px-4 bg-gradient-to-r from-[#e84752] to-[#d63842] hover:from-[#d63842] hover:to-[#bd2732] text-white text-xs font-bold rounded-xl shadow-lg shadow-[#e84752]/20 transition-all flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
            >
              <span>{isSubmitting ? 'Autenticando...' : 'Acessar Painel GGO'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="my-5 flex items-center justify-between gap-3">
            <div className="h-px bg-white/10 flex-1" />
            <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">ou</span>
            <div className="h-px bg-white/10 flex-1" />
          </div>

          <button
            type="button"
            onClick={handleSsoLogin}
            disabled={isSubmitting}
            className="w-full py-2.5 px-4 bg-white/5 hover:bg-white/10 border border-white/10 text-slate-200 text-xs font-semibold rounded-xl transition-all flex items-center justify-center space-x-2 cursor-pointer"
          >
            <Lock className="w-3.5 h-3.5 text-[#e3e0b0]" />
            <span>Entrar com Microsoft Entra ID (SSO Minerva)</span>
          </button>
        </div>

        <div className="bg-black/20 px-8 py-3.5 border-t border-white/5 text-center text-[10px] text-slate-400">
          Uso restrito e confidencial • Minerva S.A.
        </div>
      </div>
    </div>
  );
};
