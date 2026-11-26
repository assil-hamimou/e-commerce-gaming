import React from 'react';
import { Link } from 'react-router-dom';
import { Plus, Flame, Sparkles } from 'lucide-react';
import { Game } from '../types';
import { useCart } from '../context/CartContext';
import { GameArtwork } from './GameArtwork';

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
    <article className="card-brand group relative flex h-full flex-col overflow-hidden rounded-[26px]">
      
      {/* Cover / Visual Area */}
      <Link to={`/game/${game.slug || game.id}`} aria-label={`Voir ${game.title}`} className="relative block aspect-[16/10] overflow-hidden bg-[#131B2B]">
        {game.image ? (
          <img
            src={game.image.startsWith('http') ? game.image : `/assets/images/${game.image}`}
            alt={game.title}
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
          />
        ) : (
          <GameArtwork game={game} className="transition-transform duration-500 group-hover:scale-105" />
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
      <div className="flex flex-1 flex-col justify-between gap-4 p-4 sm:p-5">
        
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
            className="line-clamp-2 min-h-12 text-base font-bold leading-6 tracking-tight text-white transition-colors group-hover:text-[#CFEAE0]"
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
              <span className="whitespace-nowrap text-[16px] font-extrabold tracking-tight text-[#CFEAE0] sm:text-lg">
                {price.toFixed(2)} DH
              </span>
              {oldPrice && (
                <span className="text-xs text-[#5B91A3] line-through font-mono">
                  {oldPrice.toFixed(2)} DH
                </span>
              )}
            </div>
            <span className={`mt-1 flex items-center gap-1.5 text-[11px] font-medium ${game.stock > 0 ? 'text-[#b4c4c9]' : 'text-rose-300'}`}>
              <span className={`h-1.5 w-1.5 rounded-full ${game.stock > 0 ? 'bg-emerald-300' : 'bg-rose-400'}`} />
              {game.stock > 0 ? (game.stock <= 5 ? `Plus que ${game.stock} en stock` : 'En stock') : 'Indisponible'}
            </span>
          </div>

          <button
            onClick={handleAddToCart}
            disabled={game.stock <= 0 || loading}
            aria-label={game.stock > 0 ? `Ajouter ${game.title} au panier` : `${game.title} indisponible`}
            className={`uiverse-button px-3.5 py-2 rounded-full font-bold text-xs transition-all flex items-center gap-1.5 ${
              game.stock > 0
                ? 'bg-[#CFEAE0] text-[#131B2B] hover:bg-white active:scale-[0.98] cursor-pointer'
                : 'bg-[#2F4A63]/40 text-[#5B91A3] cursor-not-allowed'
            }`}
            title={game.stock > 0 ? 'Ajouter au panier' : 'Indisponible'}
          >
            {loading ? <span className="h-3 w-3 animate-spin rounded-full border-2 border-current border-r-transparent" /> : <Plus className="w-3.5 h-3.5" />}
            <span>{game.stock <= 0 ? 'Épuisé' : loading ? 'Ajout…' : 'Ajouter'}</span>
          </button>
        </div>

      </div>

    </article>
  );
};
