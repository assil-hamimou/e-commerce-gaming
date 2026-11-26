import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Flame, Sparkles, ArrowRight, Layers, Trophy, KeyRound, Tag, CheckCircle2 } from 'lucide-react';
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
  const [loadError, setLoadError] = useState('');
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [featuredRes, promoRes, newRes, catRes, platRes] = await Promise.all([
          gamesApi.getAll({ featured: true, limit: 4 }).catch(() => null),
          gamesApi.getAll({ promo: true, limit: 4 }).catch(() => null),
          gamesApi.getAll({ new: true, limit: 4 }).catch(() => null),
          categoriesApi.getAll().catch(() => null),
          platformsApi.getAll().catch(() => null),
        ]);

        if (featuredRes?.success) setFeaturedGames(featuredRes.games);
        if (promoRes?.success) setPromoGames(promoRes.games);
        if (newRes?.success) setNewGames(newRes.games);
        if (catRes?.success) setCategories(catRes.categories);
        if (platRes?.success) setPlatforms(platRes.platforms);
        if ([featuredRes, promoRes, newRes, catRes, platRes].some((res) => !res?.success)) {
          setLoadError('Une partie de la boutique ne répond pas. Réessayez dans un instant.');
        } else {
          setLoadError('');
        }
      } catch (err) {
        console.error('Erreur chargement données:', err);
        setLoadError('La boutique est momentanément indisponible.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [reloadKey]);

  return (
    <div className="space-y-20 pb-16">
      
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-[32px] border border-white/10 bg-[radial-gradient(ellipse_at_80%_20%,rgba(91,145,163,0.16),transparent_40%),linear-gradient(145deg,rgba(28,41,64,0.9),rgba(19,27,43,0.92))] p-6 sm:p-10 xl:p-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
          
          {/* Left Column: Big Bold Typography */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Small Brand Pill */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#182236] border border-[#2F4A63] text-xs font-bold text-[#CFEAE0] shadow-sm">
              <span className="w-2 h-2 rounded-full bg-[#CFEAE0] shadow-[0_0_8px_#CFEAE0]" />
              <span>La boutique A2SIL</span>
            </div>

            <h1 className="text-5xl sm:text-6xl xl:text-7xl font-dream-title text-white tracking-wide leading-[1.08]">
              Jeux et crédits<br />
              <span className="bg-gradient-to-r from-[#CFEAE0] via-[#5B91A3] to-[#CFEAE0] bg-clip-text text-transparent">
                au même endroit
              </span>
            </h1>

            <p className="text-base sm:text-lg text-slate-300 max-w-xl leading-7">
              Retrouvez vos jeux préférés et vos crédits de jeu au même endroit. Choisissez un article, ajoutez-le au panier et passez commande en quelques étapes.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Link
                to="/shop"
                className="btn-primary-mint uiverse-button text-sm px-7 py-3.5 flex items-center gap-2 group cursor-pointer"
              >
                <span>Explorer la boutique</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                to="/shop?promo=1"
                className="btn-primary-outline uiverse-button text-sm px-6 py-3 flex items-center gap-2"
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

          <div className="lg:col-span-5">
            {featuredGames[0] ? (
              <Link
                to={`/game/${featuredGames[0].slug || featuredGames[0].id}`}
                className="group relative isolate flex min-h-[360px] overflow-hidden rounded-[28px] border border-white/15 bg-[#182236] shadow-2xl transition-transform duration-300 hover:-translate-y-1"
              >
                {featuredGames[0].image ? (
                  <img
                    src={featuredGames[0].image.startsWith('http') ? featuredGames[0].image : `/assets/images/${featuredGames[0].image}`}
                    alt=""
                    className="absolute inset-0 -z-20 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                ) : (
                  <>
                    <div className="hero-art-backdrop absolute inset-0 z-0" />
                    <img src="/illustrations/game-world.svg" alt="" className="absolute right-[7%] top-[5%] z-0 h-[68%] w-[64%] object-contain opacity-90 transition-transform duration-700 group-hover:scale-[1.04]" />
                  </>
                )}
                <div className="absolute inset-0 z-10 bg-gradient-to-t from-[#0b111c] via-[#0b111c]/35 to-transparent" />
                <div className="relative z-20 mt-auto w-full p-6 sm:p-7">
                  <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-black/25 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-[#d9f2e9] backdrop-blur-md">
                    <Sparkles className="h-3.5 w-3.5" /> Sélection A2SIL
                  </span>
                  <div className="mt-4 flex items-end justify-between gap-4">
                    <div className="min-w-0">
                      <p className="text-xs text-white/70">À découvrir</p>
                      <h2 className="mt-1 line-clamp-2 text-2xl font-bold tracking-tight text-white sm:text-3xl">{featuredGames[0].title}</h2>
                      <p className="mt-2 text-xs text-white/65">{featuredGames[0].platform_name || 'Produit numérique'}</p>
                    </div>
                    <span className="shrink-0 rounded-2xl bg-[#CFEAE0] px-4 py-3 text-sm font-extrabold text-[#131B2B] shadow-lg">
                      {Number(featuredGames[0].price).toFixed(0)} DH
                    </span>
                  </div>
                </div>
              </Link>
            ) : loading ? (
              <div className="flex min-h-[360px] animate-pulse flex-col justify-between rounded-[28px] border border-white/10 bg-white/[0.035] p-7" aria-label="Chargement de la sélection" aria-busy="true">
                <div className="h-7 w-36 rounded-full bg-white/[0.06]" />
                <div className="h-20 w-20 rounded-3xl bg-white/[0.06]" />
                <div className="space-y-2"><div className="h-5 w-3/4 rounded bg-white/[0.06]" /><div className="h-4 w-1/2 rounded bg-white/[0.06]" /></div>
              </div>
            ) : (
              <div className="hero-art-backdrop relative isolate flex min-h-[360px] flex-col justify-between overflow-hidden rounded-[28px] border border-white/10 p-7">
                <span className="eyebrow">{loadError ? 'Connexion en cours' : 'Votre prochaine partie'}</span>
                <img src="/illustrations/game-world.svg" alt="Illustration d’un univers de jeu" className="absolute right-3 top-4 h-[62%] w-[70%] object-contain opacity-85" />
                <div>
                  <p className="text-lg font-semibold text-white">{loadError ? 'La sélection se recharge.' : 'Explorez le catalogue et trouvez votre prochain jeu.'}</p>
                  <Link to="/shop" className="quiet-link mt-3 inline-flex items-center gap-2 text-sm font-semibold">Ouvrir le catalogue <ArrowRight className="h-4 w-4" /></Link>
                </div>
              </div>
            )}
          </div>

        </div>
      </section>

      {loadError && (
        <div role="status" className="flex flex-col gap-3 rounded-2xl border border-amber-200/15 bg-amber-200/[0.04] px-4 py-3 text-sm text-[#d9d0b6] sm:flex-row sm:items-center sm:justify-between">
          <span>{loadError}</span>
          <button type="button" onClick={() => { setLoading(true); setReloadKey((key) => key + 1); }} className="shrink-0 font-semibold text-[#CFEAE0] hover:text-white">Réessayer</button>
        </div>
      )}

      <section aria-label="Les essentiels A2SIL" className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {[
          { icon: KeyRound, title: 'Catalogue clair', detail: 'Détails et disponibilité affichés avant l’achat.' },
          { icon: Tag, title: 'Prix en dirhams', detail: 'Le montant est visible dans la boutique et le panier.' },
          { icon: CheckCircle2, title: 'Suivi de commande', detail: 'Retrouvez les mises à jour depuis votre compte.' },
        ].map(({ icon: Icon, title, detail }) => (
          <div key={title} className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/[0.025] p-4 sm:p-5">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#CFEAE0]/10 text-[#CFEAE0]">
              <Icon className="h-4 w-4" />
            </span>
            <div>
              <h3 className="text-sm font-semibold text-white">{title}</h3>
              <p className="mt-1 text-xs leading-relaxed text-[#b4c4c9]">{detail}</p>
            </div>
          </div>
        ))}
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
          <div aria-label="Chargement des jeux en vedette" aria-busy="true" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="h-80 rounded-[28px] bg-[#182236] border border-[#2F4A63] animate-pulse" />
            ))}
          </div>
        ) : featuredGames.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredGames.map((game) => (
              <GameCard key={game.id} game={game} />
            ))}
          </div>
        ) : (
          <div className="surface-subtle rounded-2xl px-5 py-8 text-center text-sm text-[#b4c4c9]">
            {loadError ? 'Les jeux en vedette réapparaîtront lorsque la boutique sera reconnectée.' : 'Aucun jeu n’est mis en avant pour le moment.'}
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
