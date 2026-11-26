import React from 'react';
import { ShieldCheck, Zap, Headphones } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[#0C121D] border-t border-[#2F4A63] text-xs mt-28">
      
      {/* 3 Value props bar */}
      <div className="border-b border-[#2F4A63]/60 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-2xl bg-[#1C273E] border border-[#2F4A63] flex items-center justify-center text-[#CFEAE0] shrink-0">
                <Zap className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-white font-bold text-sm tracking-tight">Commande simple</h4>
                <p className="text-[#5B91A3] text-xs mt-0.5 leading-relaxed">
                  Consultez les détails et le prix avant de commander.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-2xl bg-[#1C273E] border border-[#2F4A63] flex items-center justify-center text-[#CFEAE0] shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-white font-bold text-sm tracking-tight">Détails transparents</h4>
                <p className="text-[#5B91A3] text-xs mt-0.5 leading-relaxed">
                  Consultez les informations de chaque produit avant de l'ajouter au panier.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-2xl bg-[#1C273E] border border-[#2F4A63] flex items-center justify-center text-[#CFEAE0] shrink-0">
                <Headphones className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-white font-bold text-sm tracking-tight">Suivi de commande</h4>
                <p className="text-[#5B91A3] text-xs mt-0.5 leading-relaxed">
                  Consultez les dernières mises à jour depuis votre compte.
                </p>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Main Footer Directory */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          
          <div className="col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <span className="font-bright-brand text-2xl tracking-wider text-white">
                A2<span className="text-[#CFEAE0]">SIL</span>
              </span>
            </div>
            <p className="text-slate-300 text-xs max-w-sm leading-relaxed">
              Une boutique simple pour acheter vos jeux et crédits numériques préférés.
            </p>
          </div>

          <div>
            <h5 className="font-bold text-white tracking-tight mb-3 text-sm">Navigation</h5>
            <ul className="space-y-2.5 text-xs text-slate-300">
              <li><Link to="/" className="hover:text-[#CFEAE0] transition-colors">Accueil</Link></li>
              <li><Link to="/shop" className="hover:text-[#CFEAE0] transition-colors">Catalogue</Link></li>
              <li><Link to="/shop?promo=1" className="hover:text-[#CFEAE0] transition-colors">Promotions</Link></li>
              <li><Link to="/shop?new=1" className="hover:text-[#CFEAE0] transition-colors">Nouveautés</Link></li>
            </ul>
          </div>

          <div>
            <h5 className="font-bold text-white tracking-tight mb-3 text-sm">Compte</h5>
            <ul className="space-y-2.5 text-xs text-slate-300">
              <li><Link to="/orders" className="hover:text-[#CFEAE0] transition-colors">Mes commandes</Link></li>
              <li><Link to="/shop" className="hover:text-[#CFEAE0] transition-colors">Voir le catalogue</Link></li>
            </ul>
          </div>

        </div>

        <div className="border-t border-[#2F4A63]/60 mt-12 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-[#5B91A3] gap-3">
          <p>© 2026 A2SIL.</p>
        </div>
      </div>
    </footer>
  );
};
