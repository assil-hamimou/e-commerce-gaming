import React from 'react';
import { Link } from 'react-router-dom';
import { Plus, Flame, Sparkles, Check, Gamepad2 } from 'lucide-react';
import { Game } from '../types';
import { useCart } from '../context/CartContext';

interface GameCardProps {
  game: Game;
}

export const GameCard: React.FC<GameCardProps> = ({ game }) => {
  const { addToCart, loading } = useCart();
  const price = typeof game.price === 'string' ? parseFloat(game.price) : game.price;
  const oldPrice = game.old_price ? (typeof game.old_price === 'string' ? parseFloat(game.old_price) : game.old_price) : null;
  const discount = oldPrice && oldPrice > price ? Math.round(((oldPrice - price) / oldPrice) * 100) : null;


  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (game.stock > 0) {
      addToCart(game.id, 1);
    }
  };

  return (
    <div className="group relative rounded-[28px] bg-[#182236] border border-[#2F4A63] hover:border-[#CFEAE0]/60 transition-all duration-300 shadow-brand-card hover:shadow-brand-card-hover flex flex-col overflow-hidden">
      
      {/* Cover / Visual Area */}
      <Link to={`/game/${game.slug || game.id}`} className="relative h-52 sm:h-56 overflow-hidden block bg-[#131B2B]">
        {game.image ? (
          <img
            src={game.image.startsWith('http') ? game.image : `/assets/images/${game.image}`}
            alt={game.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-[#1C273E] via-[#151E30] to-[#131B2B] flex flex-col items-center justify-center p-4 relative group-hover:scale-105 transition-transform duration-500">
            {/* Subtle ambient light */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(207,234,224,0.06),transparent_70%)]" />
            <Gamepad2 className="w-14 h-14 text-[#5B91A3]" aria-hidden="true" />
            <span className="mt-3 text-[11px] font-bold text-[#5B91A3] tracking-wider uppercase font-mono">{game.publisher || 'Jeu numérique'}</span>
          </div>
        )}

        {/* Floating Badges */}
        <div className="absolute top-3.5 left-3.5 flex flex-wrap gap-1.5 z-10">
          {discount && (
            <span className="flex items-center gap-1 bg-[#2F4A63] text-[#CFEAE0] border border-[#5B91A3] text-[11px] font-bold px-2.5 py-0.5 rounded-full shadow-sm">
              <Flame className="w-3 h-3 text-[#CFEAE0]" />
              -{discount}%
            </span>
          )}
          {Boolean(game.is_new) && (
            <span className="flex items-center gap-1 bg-[#131B2B]/90 backdrop-blur-sm border border-[#CFEAE0]/40 text-[#CFEAE0] text-[11px] font-bold px-2.5 py-0.5 rounded-full shadow-sm">
              <Sparkles className="w-3 h-3 text-[#5B91A3]" />
              Nouveau
            </span>
          )}
        </div>

        {/* PEGI badge */}
        {game.rating && (
          <div className="absolute top-3.5 right-3.5 z-10">
            <span className="bg-[#131B2B]/85 backdrop-blur-sm border border-[#2F4A63] text-[10px] font-bold text-[#CFEAE0] px-2.5 py-0.5 rounded-full shadow-sm">
              {game.rating}
            </span>
          </div>
        )}
      </Link>

      {/* Card Body */}
      <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between gap-3">
        
        {/* Platform & Category pill */}
        <div className="flex items-center justify-between text-xs gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-[11px] font-semibold bg-[#2F4A63]/50 border-[#5B91A3]/50 text-[#CFEAE0]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#CFEAE0]" />
            {game.platform_name || 'Multiplateforme'}
          </span>
          {game.category_name && (
            <span className="text-[#5B91A3] font-medium text-[11px] truncate">
              {game.category_name}
            </span>
          )}
        </div>

        {/* Title & Short Description */}
        <div>
          <Link
            to={`/game/${game.slug || game.id}`}
            className="font-extrabold text-base sm:text-lg text-white group-hover:text-[#CFEAE0] transition-colors line-clamp-1 tracking-tight"
            title={game.title}
          >
            {game.title}
          </Link>
          <p className="text-xs text-slate-300 line-clamp-2 mt-1 leading-relaxed">
            {game.short_description || game.description}
          </p>
        </div>

        {/* Price & Action footer */}
        <div className="pt-3 border-t border-[#2F4A63]/60 flex items-center justify-between gap-3 mt-auto">
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-extrabold text-[#CFEAE0] font-mono tracking-tight drop-shadow-[0_0_10px_rgba(207,234,224,0.2)]">
                {price.toFixed(2)} DH
              </span>
              {oldPrice && (
                <span className="text-xs text-[#5B91A3] line-through font-mono">
                  {oldPrice.toFixed(2)} DH
                </span>
              )}
            </div>
            <span className={`text-[10px] font-semibold flex items-center gap-1 ${game.stock > 0 ? 'text-[#CFEAE0]' : 'text-rose-400'}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${game.stock > 0 ? 'bg-[#CFEAE0]' : 'bg-rose-400'}`} />
              {game.stock > 0 ? `En stock (${game.stock})` : 'Rupture'}
            </span>
          </div>

          <button
            onClick={handleAddToCart}
            disabled={game.stock <= 0 || loading}
            className={`px-3.5 py-2 rounded-full font-bold text-xs transition-all flex items-center gap-1.5 ${
              game.stock > 0
                ? 'bg-[#CFEAE0] text-[#131B2B] hover:bg-white shadow-[0_2px_12px_rgba(207,234,224,0.3)] hover:scale-105 active:scale-100 cursor-pointer'
                : 'bg-[#2F4A63]/40 text-[#5B91A3] cursor-not-allowed'
            }`}
            title={game.stock > 0 ? 'Ajouter au panier' : 'Indisponible'}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Ajouter</span>
          </button>
        </div>

      </div>

    </div>
  );
};
