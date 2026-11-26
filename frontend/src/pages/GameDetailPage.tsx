import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ShoppingBag, ArrowLeft, Star, ShieldCheck, Zap, Flame, Sparkles, Check, AlertCircle } from 'lucide-react';
import { Game, Review } from '../types';
import { gamesApi } from '../services/api';
import { useCart } from '../context/CartContext';
import { GameCard } from '../components/GameCard';
import { GameArtwork } from '../components/GameArtwork';

export const GameDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { addToCart, loading: cartLoading } = useCart();

  const [game, setGame] = useState<Game | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [similarGames, setSimilarGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchGame = async () => {
      if (!id) return;
      setLoading(true);
      setError(null);
      try {
        const res = await gamesApi.getByIdOrSlug(id);
        if (res.success && res.game) {
          setGame(res.game);
          setReviews(res.reviews || []);
          setSimilarGames(res.similar || []);
          setQuantity(1);
        } else {
          setError('Jeu introuvable');
        }
      } catch (err: any) {
        setError(err.message || 'Erreur lors du chargement du jeu');
      } finally {
        setLoading(false);
      }
    };

    fetchGame();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [id]);

  if (loading) {
    return (
      <div aria-label="Chargement du produit" aria-busy="true" className="grid animate-pulse grid-cols-1 gap-8 pb-16 lg:grid-cols-12">
        <div className="aspect-[4/3] rounded-[28px] border border-white/10 bg-white/[0.035] lg:col-span-5 lg:aspect-square" />
        <div className="space-y-6 lg:col-span-7">
          <div className="h-5 w-48 rounded-full bg-white/[0.06]" />
          <div className="h-12 w-3/4 rounded-2xl bg-white/[0.06]" />
          <div className="h-24 rounded-2xl bg-white/[0.06]" />
          <div className="h-48 rounded-[24px] border border-white/10 bg-white/[0.035]" />
        </div>
      </div>
    );
  }

  if (error || !game) {
    return (
      <div className="py-24 text-center space-y-4">
        <AlertCircle className="w-9 h-9 text-[#5B91A3] mx-auto" />
        <h2 className="text-xl font-bold text-white">Ce jeu n'a pas pu être chargé</h2>
        <p className="text-xs text-[#5B91A3]">{error}</p>
        <Link
          to="/shop"
          className="btn-primary-mint inline-flex items-center gap-2 px-6 py-2.5 text-xs"
        >
          <ArrowLeft className="w-4 h-4" /> Retour à la boutique
        </Link>
      </div>
    );
  }

  const price = typeof game.price === 'string' ? parseFloat(game.price) : game.price;
  const oldPrice = game.old_price ? (typeof game.old_price === 'string' ? parseFloat(game.old_price) : game.old_price) : null;
  const discount = oldPrice && oldPrice > price ? Math.round(((oldPrice - price) / oldPrice) * 100) : null;

  return (
    <div className="space-y-14 pb-16">
      
      {/* Back button */}
      <div>
        <Link
          to="/shop"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-[#5B91A3] hover:text-[#CFEAE0] transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Retour au catalogue
        </Link>
      </div>

      {/* Main Product Showcase */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* Cover / Visual */}
        <div className="lg:col-span-5">
          <div className="card-brand sticky top-28 relative flex aspect-[4/3] flex-col items-center justify-center overflow-hidden rounded-[28px] sm:aspect-square">
            {game.image ? (
              <img
                src={game.image.startsWith('http') ? game.image : `/assets/images/${game.image}`}
                alt={game.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <GameArtwork game={game} />
            )}

            {/* Badges */}
            <div className="absolute top-4 left-4 flex flex-col gap-2">
              {discount && (
                <span className="bg-[#2F4A63] text-[#CFEAE0] border border-[#5B91A3] text-xs font-bold px-3 py-1 rounded-full shadow-sm flex items-center gap-1">
                  <Flame className="w-3.5 h-3.5 text-[#CFEAE0]" />
                  -{discount}% OFF
                </span>
              )}
              {Boolean(game.is_new) && (
                <span className="bg-[#131B2B]/90 backdrop-blur-sm border border-[#CFEAE0]/40 text-[#CFEAE0] text-xs font-bold px-3 py-1 rounded-full shadow-sm flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-[#5B91A3]" />
                  NOUVEAUTÉ
                </span>
              )}
            </div>

            {game.rating && (
              <div className="absolute top-4 right-4 bg-[#131B2B]/85 backdrop-blur-sm border border-[#2F4A63] text-[10px] font-bold text-[#CFEAE0] px-3 py-1 rounded-full shadow-sm">
                {game.rating}
              </div>
            )}
          </div>
        </div>

        {/* Details & Purchase Box */}
        <div className="lg:col-span-7 space-y-6">
          
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-[#2F4A63]/60 border border-[#5B91A3]/40 text-[#CFEAE0] text-xs font-bold shadow-sm">
                {game.platform_name || 'Multiplateforme'}
              </span>
              {game.category_name && (
                <span className="px-3 py-1 rounded-full bg-[#182236] text-[#CFEAE0] border border-[#2F4A63] text-xs font-bold">
                  {game.category_name}
                </span>
              )}
              {game.publisher && (
                <span className="text-xs text-[#5B91A3]">
                  Éditeur : <strong className="text-white font-semibold">{game.publisher}</strong>
                </span>
              )}
            </div>

            <h1 className="text-3xl sm:text-5xl text-white leading-tight font-dream-title">
              {game.title}
            </h1>

            {game.short_description && (
              <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
                {game.short_description}
              </p>
            )}
          </div>

          {/* Pricing Box */}
          <div className="surface-panel space-y-5 rounded-[24px] p-5 sm:p-7">
            <div className="flex items-baseline gap-4">
              <span className="text-3xl font-black tracking-tight text-[#CFEAE0] sm:text-4xl">
                {price.toFixed(2)} DH
              </span>
              {oldPrice && (
                <span className="text-base text-[#5B91A3] line-through font-mono">
                  {oldPrice.toFixed(2)} DH
                </span>
              )}
              {discount && oldPrice && (
                <span className="text-xs font-bold text-[#CFEAE0] bg-[#2F4A63] border border-[#5B91A3] px-2.5 py-0.5 rounded-full font-mono">
                  Économie {(oldPrice - price).toFixed(2)} DH
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 text-xs">
              <span className={`flex items-center gap-2 font-semibold ${game.stock > 0 ? 'text-emerald-200' : 'text-rose-300'}`}>
                <span className={`h-2 w-2 rounded-full ${game.stock > 0 ? 'bg-emerald-300' : 'bg-rose-400'}`} />
                {game.stock > 0 ? (game.stock <= 5 ? `Plus que ${game.stock} en stock` : 'En stock') : 'Indisponible'}
              </span>
            </div>

            {/* Quantity and CTA */}
            {game.stock > 0 ? (
              <div className="flex flex-col sm:flex-row gap-3 pt-1">
                <div className="flex items-center border border-[#2F4A63] rounded-full bg-[#131B2B] px-4 py-2 w-fit">
                  <span className="text-xs text-[#5B91A3] mr-3 font-semibold">Quantité :</span>
                  <select
                    value={quantity}
                    onChange={(e) => setQuantity(parseInt(e.target.value, 10))}
                    className="bg-transparent text-xs font-bold text-[#CFEAE0] focus:outline-none font-mono"
                  >
                    {Array.from({ length: Math.min(10, game.stock) }, (_, i) => i + 1).map((n) => (
                      <option key={n} value={n} className="bg-[#182236] text-white">
                        {n}
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  onClick={() => addToCart(game.id, quantity)}
                  disabled={cartLoading}
                  aria-label={`Ajouter ${game.title}, quantité ${quantity}, au panier`}
                  className="btn-primary-mint uiverse-button flex-1 py-3.5 px-7 rounded-full font-bold text-xs flex items-center justify-center gap-2 cursor-pointer"
                >
                  {cartLoading ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-[#131B2B] border-r-transparent" /> : <ShoppingBag className="w-4 h-4 text-[#131B2B]" />}
                  <span>{cartLoading ? 'Ajout…' : 'Ajouter au panier'}</span>
                </button>
              </div>
            ) : (
              <button type="button" disabled className="w-full cursor-not-allowed rounded-2xl border border-white/10 bg-white/[0.035] py-3.5 text-sm font-semibold text-[#8ba8b4]">
                Indisponible actuellement
              </button>
            )}

            <div className="grid grid-cols-2 gap-3 pt-2 text-[11px] text-[#5B91A3] border-t border-[#2F4A63]/60">
              <span className="flex items-center gap-1.5 font-medium">
                <Zap className="w-3.5 h-3.5 text-[#CFEAE0]" /> Produit numérique
              </span>
              <span className="flex items-center gap-1.5 font-medium">
                <ShieldCheck className="w-3.5 h-3.5 text-[#CFEAE0]" /> Informations du produit
              </span>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-[#5B91A3] uppercase tracking-wider">
              À propos du jeu
            </h3>
            <div className="surface-panel whitespace-pre-line rounded-[24px] p-5 text-sm leading-relaxed text-slate-300 sm:p-6">
              {game.description}
            </div>
          </div>

          {/* Specs / Meta */}
          <div className="grid grid-cols-3 gap-3 p-4 rounded-2xl bg-[#182236] border border-[#2F4A63] text-xs">
            <div>
              <span className="text-[#5B91A3] text-[10px] font-bold block uppercase">Date de sortie</span>
              <span className="text-white font-semibold">{game.release_date || 'Non spécifiée'}</span>
            </div>
            <div>
              <span className="text-[#5B91A3] text-[10px] font-bold block uppercase">Classification</span>
              <span className="text-white font-semibold">{game.rating || 'PEGI 3'}</span>
            </div>
            <div>
              <span className="text-[#5B91A3] text-[10px] font-bold block uppercase">Éditeur</span>
              <span className="text-white font-semibold truncate block">{game.publisher || 'Studio'}</span>
            </div>
          </div>

        </div>

      </div>

      {/* Reviews section */}
      {reviews.length > 0 && (
        <section className="space-y-6 pt-10 border-t border-[#2F4A63]/60">
          <h2 className="text-xl sm:text-2xl text-white flex items-center gap-2 font-dream-title">
            <Star className="w-5 h-5 text-[#CFEAE0] fill-[#CFEAE0]" />
            Avis des Joueurs ({reviews.length})
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {reviews.map((rev) => (
              <div key={rev.id} className="p-5 rounded-[24px] bg-[#182236] border border-[#2F4A63] space-y-2.5 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-[#2F4A63] text-[#CFEAE0] flex items-center justify-center font-bold text-xs uppercase">
                      {(rev.username || 'Gamer').slice(0, 2)}
                    </div>
                    <div>
                      <span className="text-xs font-bold text-white block">{rev.username || 'Gamer'}</span>
                      <span className="text-[10px] text-[#5B91A3] font-mono">{new Date(rev.created_at).toLocaleDateString('fr-FR')}</span>
                    </div>
                  </div>
                  <div className="flex items-center text-[#CFEAE0] text-xs">
                    {Array.from({ length: 5 }, (_, i) => (
                      <Star
                        key={i}
                        className={`w-3 h-3 ${i < rev.rating ? 'fill-[#CFEAE0] text-[#CFEAE0]' : 'text-[#2F4A63]'}`}
                      />
                    ))}
                  </div>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">{rev.comment}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Similar Games */}
      {similarGames.length > 0 && (
        <section className="space-y-6 pt-10 border-t border-[#2F4A63]/60">
          <h2 className="text-xl sm:text-2xl text-white font-dream-title">
            Dans la même catégorie
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {similarGames.map((sim) => (
              <GameCard key={sim.id} game={sim} />
            ))}
          </div>
        </section>
      )}

    </div>
  );
};
