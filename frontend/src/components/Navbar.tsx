import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ShoppingBag, Search, LogOut, Package, Flame, Sparkles, ChevronDown, Compass, ImagePlus } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

export const Navbar: React.FC = () => {
  const { cart, setIsCartOpen } = useCart();
  const { user, isAuthenticated, logout, setIsAuthModalOpen } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [brandLogo, setBrandLogo] = useState(() => localStorage.getItem('a2sil-brand-logo') || '');
  const navigate = useNavigate();
  const location = useLocation();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchTerm.trim())}`);
    }
  };

  const isActive = (path: string) => location.pathname === path;
  const adminUrl = window.location.port === '5173'
    ? 'http://localhost:8080/game-store/admin/'
    : '/game-store/admin/';

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !file.type.startsWith('image/') || file.size > 2 * 1024 * 1024) return;
    const reader = new FileReader();
    reader.onload = () => {
      const image = String(reader.result || '');
      localStorage.setItem('a2sil-brand-logo', image);
      setBrandLogo(image);
    };
    reader.readAsDataURL(file);
  };

  return (
    <header className="sticky top-0 z-40 navbar-brand transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-4">
          
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-3 group shrink-0">
            <label onClick={(event) => event.stopPropagation()} className="relative w-10 h-10 rounded-2xl bg-[#1C273E] border border-dashed border-[#5B91A3]/60 hover:border-[#CFEAE0] flex items-center justify-center overflow-hidden cursor-pointer" title="Ajouter ou remplacer le logo">
              {brandLogo ? <img src={brandLogo} alt="Logo A2SIL personnalisé" className="w-full h-full object-contain" /> : <ImagePlus className="w-4 h-4 text-[#CFEAE0]" />}
              <input type="file" accept="image/*" onChange={handleLogoUpload} className="sr-only" aria-label="Ajouter votre logo" />
            </label>

            <div className="flex flex-col">
              <span className="font-bright-brand text-2xl tracking-wider text-white flex items-center gap-1.5">
                A2<span className="text-[#CFEAE0]">SIL</span>
                <span className="text-[10px] font-sans font-bold tracking-wider uppercase px-2 py-0.5 rounded-full bg-[#2F4A63] text-[#CFEAE0] border border-[#5B91A3]/40">
                  GAMES
                </span>
              </span>
              <span className="text-[10px] text-[#5B91A3] -mt-0.5 tracking-tight font-medium">Jeux et crédits numériques</span>
            </div>
          </Link>

          {/* Nav Segmented Links */}
          <nav className="hidden md:flex items-center p-1 rounded-full bg-[#182236] border border-[#2F4A63] text-xs font-semibold">
            <Link
              to="/"
              className={`px-4 py-2 rounded-full transition-all ${
                isActive('/') 
                  ? 'bg-[#2F4A63] text-[#CFEAE0] shadow-sm' 
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              Accueil
            </Link>
            <Link
              to="/shop"
              className={`px-4 py-2 rounded-full transition-all ${
                isActive('/shop') 
                  ? 'bg-[#2F4A63] text-[#CFEAE0] shadow-sm' 
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              Boutique
            </Link>
            <Link
              to="/shop?promo=1"
              className="px-4 py-2 rounded-full text-slate-300 hover:text-[#CFEAE0] transition-all flex items-center gap-1.5"
            >
              <Flame className="w-3.5 h-3.5 text-[#5B91A3]" />
              Promotions
            </Link>
            <Link
              to="/shop?new=1"
              className="px-4 py-2 rounded-full text-slate-300 hover:text-[#CFEAE0] transition-all flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#CFEAE0]" />
              Nouveautés
            </Link>
          </nav>

          {/* Search bar */}
          <form onSubmit={handleSearch} className="flex-1 max-w-xs hidden lg:block">
            <div className="relative">
              <input
                type="text"
                placeholder="Rechercher un jeu..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-[#182236] focus:bg-[#1C273E] border border-[#2F4A63] focus:border-[#CFEAE0] text-xs rounded-full pl-9 pr-4 py-2 text-[#CFEAE0] placeholder-[#5B91A3] focus:outline-none transition-all shadow-sm"
              />
              <Search className="w-3.5 h-3.5 text-[#5B91A3] absolute left-3 top-2.5" />
            </div>
          </form>

          {/* Right Action Cluster */}
          <div className="flex items-center gap-3 shrink-0">
            
            {/* Top Right Brand Tag in Bright Marching Font */}
            <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#182236] border border-[#2F4A63] shadow-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-[#CFEAE0] shadow-[0_0_8px_#CFEAE0]" />
              <span className="font-sans font-extrabold text-base tracking-wide text-[#CFEAE0]">a2sil</span>
            </div>

            {/* Cart Button */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="flex items-center gap-2 px-3.5 py-2 rounded-full bg-[#182236] hover:bg-[#1C273E] border border-[#2F4A63] hover:border-[#CFEAE0] text-xs font-semibold text-[#CFEAE0] transition-all shadow-sm group"
              title="Ouvrir le panier"
            >
              <ShoppingBag className="w-4 h-4 text-[#CFEAE0]" />
              <span className="font-mono font-bold">
                {cart.totalPrice.toFixed(2)} DH
              </span>
              {cart.totalCount > 0 && (
                <span className="px-1.5 py-0.5 rounded-full bg-[#CFEAE0] text-[#131B2B] text-[10px] font-black">
                  {cart.totalCount}
                </span>
              )}
            </button>

            {/* Auth Button */}
            {isAuthenticated && user ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 px-3.5 py-2 rounded-full bg-[#182236] border border-[#2F4A63] hover:border-[#CFEAE0] text-xs font-semibold text-white transition-all shadow-sm"
                >
                  <div className="w-5 h-5 rounded-full bg-[#2F4A63] text-[#CFEAE0] flex items-center justify-center text-[10px] font-bold uppercase">
                    {user.username.slice(0, 2)}
                  </div>
                  <span className="hidden sm:inline max-w-[80px] truncate">{user.username}</span>
                  <ChevronDown className="w-3.5 h-3.5 text-[#5B91A3]" />
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-[#182236] border border-[#2F4A63] shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                    <div className="px-3 py-2 border-b border-[#2F4A63]/60 mb-1">
                      <p className="text-[10px] font-semibold text-[#5B91A3] uppercase tracking-wider">
                        {user.role === 'admin' ? 'Administrateur' : 'Client actif'}
                      </p>
                      <p className="text-xs font-bold text-[#CFEAE0] truncate">{user.email}</p>
                    </div>

                    <Link
                      to="/orders"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-200 hover:text-[#CFEAE0] hover:bg-[#2F4A63]/50 transition-colors"
                    >
                      <Package className="w-3.5 h-3.5 text-[#5B91A3]" />
                      Mes Commandes & Clés
                    </Link>

                    {user.role === 'admin' && (
                      <a
                        href={adminUrl}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-[#CFEAE0] hover:bg-[#2F4A63]/50 transition-colors"
                      >
                        <Compass className="w-3.5 h-3.5 text-[#CFEAE0]" />
                        Administration
                      </a>
                    )}

                    <div className="border-t border-[#2F4A63]/60 my-1" />

                    <button
                      onClick={() => {
                        setUserMenuOpen(false);
                        logout();
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-rose-400 hover:bg-rose-500/10 transition-colors"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      Déconnexion
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => setIsAuthModalOpen(true)}
                className="btn-primary-mint text-xs cursor-pointer"
              >
                Connecter
              </button>
            )}

          </div>

        </div>
      </div>
    </header>
  );
};
