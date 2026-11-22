import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Flame, Sparkles, ArrowRight, ShieldCheck, Zap, Layers, Trophy, KeyRound, Tag, Gamepad2 } from 'lucide-react';
import { Game, Category, Platform } from '../types';
import { gamesApi, categoriesApi, platformsApi } from '../services/api';
import { GameCard } from '../components/GameCard';

export const HomePage: React.FC = () => {
  const [featuredGames, setFeaturedGames] = useState<Game[]>([]);
  const [promoGames, setPromoGames] = useState<Game[]>([]);
  const [newGames, setNewGames] = useState<Game[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [platforms, setPlatforms] = useState<Platform[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [featuredRes, promoRes, newRes, catRes, platRes] = await Promise.all([
          gamesApi.getAll({ featured: true, limit: 4 }),
          gamesApi.getAll({ promo: true, limit: 4 }),
          gamesApi.getAll({ new: true, limit: 4 }),
          categoriesApi.getAll(),
          platformsApi.getAll(),
        ]);

        if (featuredRes.success) setFeaturedGames(featuredRes.games);
        if (promoRes.success) setPromoGames(promoRes.games);
        if (newRes.success) setNewGames(newRes.games);
        if (catRes.success) setCategories(catRes.categories);
        if (platRes.success) setPlatforms(platRes.platforms);
      } catch (err) {
        console.error('Erreur chargement données:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="space-y-24 pb-20">
      
      {/* Hero Section */}
      <section className="relative pt-6 sm:pt-10 pb-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center">
          
          {/* Left Column: Big Bold Typography */}
          <div className="lg:col-span-12 max-w-5xl space-y-6">
            
            {/* Small Brand Pill */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#182236] border border-[#2F4A63] text-xs font-bold text-[#CFEAE0] shadow-sm">
              <span className="w-2 h-2 rounded-full bg-[#CFEAE0] shadow-[0_0_8px_#CFEAE0]" />
              <span>La boutique A2SIL</span>
            </div>

            <h1 className="text-5xl sm:text-7xl xl:text-8xl font-dream-title text-white tracking-wide leading-[1.1]">
              Jeux et crédits <br />
              <span className="bg-gradient-to-r from-[#CFEAE0] via-[#5B91A3] to-[#CFEAE0] bg-clip-text text-transparent">
                au même endroit
              </span>
            </h1>

            <p className="text-base sm:text-lg text-slate-300 max-w-xl leading-relaxed">
              Retrouvez vos jeux préférés et vos crédits de jeu au même endroit. Choisissez un article, ajoutez-le au panier et passez commande en quelques étapes.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Link
                to="/shop"
                className="btn-primary-mint text-sm px-7 py-3.5 flex items-center gap-2 group cursor-pointer"
              >
                <span>Explorer la boutique</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                to="/shop?promo=1"
                className="btn-primary-outline text-sm px-6 py-3 flex items-center gap-2"
              >
                <Flame className="w-4 h-4 text-[#CFEAE0]" />
                <span>Voir les promotions</span>
              </Link>
            </div>

            {/* Platform pills */}
            <div className="pt-6 border-t border-[#2F4A63]/60 flex flex-wrap items-center gap-2 text-xs">
              <span className="text-[#5B91A3] font-semibold mr-1">Plateformes :</span>
              {platforms.map((p) => (
                <Link
                  key={p.id}
                  to={`/shop?platform=${p.slug}`}
                  className="px-3 py-1 rounded-full bg-[#182236] hover:bg-[#2F4A63] border border-[#2F4A63] hover:border-[#CFEAE0] text-slate-200 font-medium transition-all"
                >
                  {p.name}
                </Link>
              ))}
            </div>

          </div>

        </div>
      </section>

      {/* How the store works */}
      <section className="space-y-6">
        <div className="text-center max-w-2xl mx-auto space-y-2 mb-10">
          <h2 className="text-3xl sm:text-5xl font-dream-title text-white tracking-wide">
            Pourquoi choisir A2SIL
          </h2>
          <p className="text-xs sm:text-sm text-[#5B91A3]">
            Une boutique claire, avec les prix en dirhams et un panier simple à utiliser.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          
          {/* Card 1: Primary Dark */}
          <div className="p-7 rounded-[32px] bg-[#182236] border border-[#2F4A63] shadow-brand-card flex flex-col justify-between space-y-4 hover:border-[#CFEAE0]/50 transition-all">
            <div className="w-12 h-12 rounded-2xl bg-[#2F4A63] text-[#CFEAE0] flex items-center justify-center text-2xl shadow-sm">
              <KeyRound className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-[#5B91A3] uppercase tracking-wider font-mono">
                En quelques clics
              </span>
              <h3 className="text-lg font-bold text-white tracking-tight">
                Clés Officielles
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Retrouvez les informations et le prix de chaque article avant de l'ajouter au panier.
              </p>
            </div>
          </div>

          {/* Card 2 */}
          <div className="p-7 rounded-[32px] bg-[#182236] border border-[#2F4A63] shadow-brand-card flex flex-col justify-between space-y-4 hover:border-[#CFEAE0]/50 transition-all">
            <div className="w-12 h-12 rounded-2xl bg-[#2F4A63] text-[#CFEAE0] flex items-center justify-center text-2xl shadow-sm">
              <Zap className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-[#5B91A3] uppercase tracking-wider font-mono">
                Étape 1
              </span>
              <h3 className="text-lg font-bold text-white tracking-tight">
                Choisissez un article
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Choisissez les jeux ou les crédits qui vous intéressent.
              </p>
            </div>
          </div>

          {/* Card 3 */}
          <div className="p-7 rounded-[32px] bg-[#182236] border border-[#2F4A63] shadow-brand-card flex flex-col justify-between space-y-4 hover:border-[#CFEAE0]/50 transition-all">
            <div className="w-12 h-12 rounded-2xl bg-[#2F4A63] text-[#CFEAE0] flex items-center justify-center text-2xl shadow-sm">
              <Tag className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-[#5B91A3] uppercase tracking-wider font-mono">
                Étape 2
              </span>
              <h3 className="text-lg font-bold text-white tracking-tight">
                Prix affichés en DH
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Le total est affiché en dirhams avant la confirmation.
              </p>
            </div>
          </div>

          {/* Card 4 */}
          <div className="p-7 rounded-[32px] bg-[#182236] border border-[#2F4A63] shadow-brand-card flex flex-col justify-between space-y-4 hover:border-[#CFEAE0]/50 transition-all">
            <div className="w-12 h-12 rounded-2xl bg-[#2F4A63] text-[#CFEAE0] flex items-center justify-center text-2xl shadow-sm">
              <Gamepad2 className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-[#5B91A3] uppercase tracking-wider font-mono">
                Étape 3
              </span>
              <h3 className="text-lg font-bold text-white tracking-tight">
                Passez votre commande
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Connectez-vous, indiquez vos informations et confirmez votre commande.
              </p>
            </div>
          </div>

        </div>
      </section>

      {/* Featured Games Section */}
      <section className="space-y-6">
        <div className="flex items-end justify-between border-b border-[#2F4A63]/60 pb-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#182236] border border-[#2F4A63] text-[10px] font-bold text-[#CFEAE0] mb-2">
              <Trophy className="w-3 h-3 text-[#CFEAE0]" />
                À DÉCOUVRIR
            </div>
            <h2 className="text-3xl sm:text-4xl font-dream-title text-white tracking-wide">
              Jeux en Vedette
            </h2>
            <p className="text-xs text-[#5B91A3] mt-1">Les sorties les plus populaires auprès des joueurs</p>
          </div>
          <Link to="/shop" className="text-xs font-bold text-[#CFEAE0] hover:underline flex items-center gap-1">
            Voir tout le catalogue <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="h-80 rounded-[28px] bg-[#182236] border border-[#2F4A63] animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredGames.map((game) => (
              <GameCard key={game.id} game={game} />
            ))}
          </div>
        )}
      </section>

      {/* Special Promotions Section */}
      {promoGames.length > 0 && (
        <section className="space-y-6">
          <div className="flex items-end justify-between border-b border-[#2F4A63]/60 pb-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#2F4A63] text-[#CFEAE0] border border-[#5B91A3]/40 text-[10px] font-bold mb-2">
                <Flame className="w-3 h-3 text-[#CFEAE0]" />
                PRIX RÉDUITS
              </div>
              <h2 className="text-3xl sm:text-4xl font-dream-title text-white tracking-wide">
                Promotions Spéciales
              </h2>
              <p className="text-xs text-[#5B91A3] mt-1">Réductions exclusives avant épuisement des stocks de clés</p>
            </div>
            <Link to="/shop?promo=1" className="text-xs font-bold text-[#CFEAE0] hover:underline flex items-center gap-1">
              Toutes les promotions <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {promoGames.map((game) => (
              <GameCard key={game.id} game={game} />
            ))}
          </div>
        </section>
      )}

      {/* Categories Showcase */}
      {categories.length > 0 && (
        <section className="space-y-6">
          <div className="flex items-end justify-between border-b border-[#2F4A63]/60 pb-4">
            <div>
              <h2 className="text-3xl sm:text-4xl font-dream-title text-white tracking-wide">
                Explorer les catégories
              </h2>
              <p className="text-xs text-[#5B91A3] mt-1">Jeux d'action, sport et crédits numériques</p>
            </div>
            <Link to="/shop" className="text-xs font-bold text-[#CFEAE0] hover:underline flex items-center gap-1">
              Tous les genres <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3.5">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                to={`/shop?category=${cat.slug}`}
                className="p-5 rounded-[24px] bg-[#182236] border border-[#2F4A63] hover:border-[#CFEAE0]/50 transition-all group text-center shadow-sm hover:shadow-md"
              >
                <div className="flex justify-center mb-2 text-[#CFEAE0] group-hover:scale-110 transition-transform">
                  <Layers className="w-7 h-7" />
                </div>
                <h3 className="text-xs font-bold text-white group-hover:text-[#CFEAE0] transition-colors">
                  {cat.name}
                </h3>
                <span className="text-[10px] text-[#5B91A3] mt-0.5 block font-mono">
                  {cat.games_count ? `${cat.games_count} jeux` : 'Disponible'}
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* New Releases Section */}
      {newGames.length > 0 && (
        <section className="space-y-6">
          <div className="flex items-end justify-between border-b border-[#2F4A63]/60 pb-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#182236] border border-[#2F4A63] text-[#CFEAE0] text-[10px] font-bold mb-2">
                <Sparkles className="w-3 h-3 text-[#CFEAE0]" />
                NOUVEAUTÉS
              </div>
              <h2 className="text-3xl sm:text-4xl font-dream-title text-white tracking-wide">
                Derniers Jeux Ajoutés
              </h2>
              <p className="text-xs text-[#5B91A3] mt-1">Les dernières nouveautés ajoutées au catalogue</p>
            </div>
            <Link to="/shop?new=1" className="text-xs font-bold text-[#CFEAE0] hover:underline flex items-center gap-1">
              Toutes les nouveautés <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {newGames.map((game) => (
              <GameCard key={game.id} game={game} />
            ))}
          </div>
        </section>
      )}

    </div>
  );
};
