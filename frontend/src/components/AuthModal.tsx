import React, { useState } from 'react';
import { X, Lock, Mail, User as UserIcon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const AuthModal: React.FC = () => {
  const { isAuthModalOpen, setIsAuthModalOpen, login, register } = useAuth();
  const [tab, setTab] = useState<'login' | 'register'>('login');

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isAuthModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (tab === 'login') {
      const res = await login(email, password);
      if (!res.success) {
        setError(res.message || 'Identifiants invalides');
      }
    } else {
      const res = await register({
        username,
        email,
        password,
        first_name: firstName,
        last_name: lastName,
      });
      if (!res.success) {
        setError(res.message || 'Erreur lors de l\'inscription');
      }
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-md transition-opacity"
        onClick={() => setIsAuthModalOpen(false)}
      />

      <div role="dialog" aria-modal="true" aria-labelledby="auth-title" className="surface-panel relative z-10 max-h-[90vh] w-full max-w-md animate-in fade-in zoom-in-95 overflow-y-auto rounded-[28px] p-6 shadow-2xl duration-200 sm:p-8">
        
        {/* Close Button */}
        <button
          onClick={() => setIsAuthModalOpen(false)}
          className="absolute top-5 right-5 p-1.5 rounded-full text-[#5B91A3] hover:text-white hover:bg-[#2F4A63] transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex flex-col items-center text-center mb-6">
          <h2 id="auth-title" className="text-2xl text-white font-dream-title">
            {tab === 'login' ? 'Connexion Joueur' : 'Nouveau Compte'}
          </h2>
          <p className="text-xs text-[#5B91A3] mt-1">
            {tab === 'login'
              ? 'Connectez-vous pour commander et retrouver votre historique.'
              : 'Créez un compte pour commander et suivre vos achats.'}
          </p>
        </div>

        {/* Segmented Control */}
        <div role="tablist" aria-label="Type de compte" className="mb-6 flex rounded-2xl border border-white/10 bg-[#131B2B] p-1 text-xs font-bold">
          <button
            type="button"
            role="tab"
            aria-selected={tab === 'login'}
            onClick={() => { setTab('login'); setError(null); }}
            className={`flex-1 rounded-xl py-2.5 transition-all ${
              tab === 'login'
                ? 'bg-[#2F4A63] text-[#CFEAE0] shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Connexion
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={tab === 'register'}
            onClick={() => { setTab('register'); setError(null); }}
            className={`flex-1 rounded-xl py-2.5 transition-all ${
              tab === 'register'
                ? 'bg-[#2F4A63] text-[#CFEAE0] shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Créer un compte
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {error && (
            <div role="alert" className="rounded-2xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs font-medium text-rose-200">
              {error}
            </div>
          )}

          {tab === 'register' && (
            <>
              <div>
                <label className="block text-[11px] font-bold text-slate-300 mb-1">
                  Nom d'utilisateur *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Votre nom d'utilisateur"
                    className="w-full bg-[#131B2B] border border-[#2F4A63] focus:border-[#CFEAE0] rounded-2xl pl-10 pr-4 py-2.5 text-xs text-[#CFEAE0] placeholder-[#5B91A3] focus:outline-none transition-all"
                  />
                  <UserIcon className="w-4 h-4 text-[#5B91A3] absolute left-3.5 top-3" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">Prénom</label>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="Alex"
                    className="w-full bg-[#131B2B] border border-[#2F4A63] focus:border-[#CFEAE0] rounded-2xl px-3 py-2.5 text-xs text-[#CFEAE0] placeholder-[#5B91A3] focus:outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">Nom</label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Dupont"
                    className="w-full bg-[#131B2B] border border-[#2F4A63] focus:border-[#CFEAE0] rounded-2xl px-3 py-2.5 text-xs text-[#CFEAE0] placeholder-[#5B91A3] focus:outline-none transition-all"
                  />
                </div>
              </div>
            </>
          )}

          <div>
            <label className="block text-[11px] font-bold text-slate-300 mb-1">
              Adresse Email *
            </label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="vous@domaine.com"
                className="w-full bg-[#131B2B] border border-[#2F4A63] focus:border-[#CFEAE0] rounded-2xl pl-10 pr-4 py-2.5 text-xs text-[#CFEAE0] placeholder-[#5B91A3] focus:outline-none transition-all"
              />
              <Mail className="w-4 h-4 text-[#5B91A3] absolute left-3.5 top-3" />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-300 mb-1">
              Mot de passe *
            </label>
            <div className="relative">
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-[#131B2B] border border-[#2F4A63] focus:border-[#CFEAE0] rounded-2xl pl-10 pr-4 py-2.5 text-xs text-[#CFEAE0] placeholder-[#5B91A3] focus:outline-none transition-all"
              />
              <Lock className="w-4 h-4 text-[#5B91A3] absolute left-3.5 top-3" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            aria-busy={loading}
            className="btn-primary-mint w-full py-3.5 rounded-full text-xs font-bold transition-all mt-4 cursor-pointer"
          >
            {loading ? 'Chargement...' : tab === 'login' ? 'Se connecter' : 'Valider l\'inscription'}
          </button>

          {tab === 'login' && (
            <p className="text-center text-[11px] text-[#5B91A3] mt-2">
              Connectez-vous avec votre adresse e-mail et votre mot de passe.
            </p>
          )}

        </form>

      </div>
    </div>
  );
};
