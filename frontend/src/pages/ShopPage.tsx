import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SlidersHorizontal, RotateCcw, Search, ChevronLeft, ChevronRight, Flame, Sparkles } from 'lucide-react';
import { Game, Category, Platform } from '../types';
import { gamesApi, categoriesApi, platformsApi } from '../services/api';
import { GameCard } from '../components/GameCard';

export const ShopPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [games, setGames] = useState<Game[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [platforms, setPlatforms] = useState<Platform[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Filters from query params
  const currentCategory = searchParams.get('category') || '';
  const currentPlatform = searchParams.get('platform') || '';
  const currentSearch = searchParams.get('search') || '';
  const currentPromo = searchParams.get('promo') === '1';
  const currentNew = searchParams.get('new') === '1';
  const currentSort = searchParams.get('sort') || 'newest';
  const currentPage = parseInt(searchParams.get('page') || '1', 10);

  const [searchInput, setSearchInput] = useState(currentSearch);

  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const [catRes, platRes] = await Promise.all([
          categoriesApi.getAll(),
          platformsApi.getAll(),
        ]);
        if (catRes.success) setCategories(catRes.categories);
        if (platRes.success) setPlatforms(platRes.platforms);
      } catch (err) {
        console.error(err);
      }
    };
    fetchMetadata();
  }, []);

  useEffect(() => {
    const fetchGames = async () => {
      setLoading(true);
      try {
        const res = await gamesApi.getAll({
          category: currentCategory || undefined,
          platform: currentPlatform || undefined,
          search: currentSearch || undefined,
          promo: currentPromo ? true : undefined,
          new: currentNew ? true : undefined,
          sort: currentSort,
          page: currentPage,
          limit: 12,
        });

        if (res.success) {
          setGames(res.games);
          setTotalPages(res.totalPages);
          setTotalCount(res.total);
        }
      } catch (err) {
        console.error('Erreur chargement jeux:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchGames();
  }, [currentCategory, currentPlatform, currentSearch, currentPromo, currentNew, currentSort, currentPage]);

  const updateFilter = (key: string, value: string | null) => {
    const next = new URLSearchParams(searchParams);
    if (value === null || value === '') {
      next.delete(key);
    } else {
      next.set(key, value);
    }
    next.delete('page');
    setSearchParams(next);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateFilter('search', searchInput.trim() || null);
  };

  const resetAllFilters = () => {
    setSearchInput('');
    setSearchParams(new URLSearchParams());
  };

  const hasActiveFilters = currentCategory || currentPlatform || currentSearch || currentPromo || currentNew || currentSort !== 'newest';

  return (
    <div className="space-y-8 pb-20">
      
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#2F4A63]/60 pb-6">
        <div>
          <h1 className="text-3xl sm:text-4xl text-white font-dream-title">
            Catalogue des produits
          </h1>
          <p className="text-xs text-[#5B91A3] mt-1 font-mono">
            {totalCount} {totalCount > 1 ? 'titres répertoriés' : 'titre répertorié'}
          </p>
        </div>

        {/* Search bar inside shop */}
        <form onSubmit={handleSearchSubmit} className="flex gap-2 max-w-sm w-full">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Filtrer par titre ou éditeur..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full bg-[#182236] border border-[#2F4A63] focus:border-[#CFEAE0] text-xs rounded-full pl-9 pr-4 py-2.5 text-[#CFEAE0] placeholder-[#5B91A3] focus:outline-none transition-all shadow-sm"
            />
            <Search className="w-3.5 h-3.5 text-[#5B91A3] absolute left-3.5 top-3" />
          </div>
          <button
            type="submit"
            className="btn-primary-mint px-5 py-2.5 text-xs"
          >
            Filtrer
          </button>
        </form>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Sidebar Filters */}
        <aside className="space-y-6">
          <div className="p-6 rounded-[28px] bg-[#182236] border border-[#2F4A63] shadow-brand-card space-y-6">
            
            <div className="flex items-center justify-between border-b border-[#2F4A63]/60 pb-3">
              <span className="font-bold text-white text-xs flex items-center gap-2 tracking-tight">
                <SlidersHorizontal className="w-3.5 h-3.5 text-[#CFEAE0]" />
                Filtres & Tri
              </span>
              {hasActiveFilters && (
                <button
                  onClick={resetAllFilters}
                  className="text-[11px] text-[#CFEAE0] font-bold hover:underline flex items-center gap-1"
                >
                  <RotateCcw className="w-3 h-3" />
                  Réinitialiser
                </button>
              )}
            </div>

            {/* Tri */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-[#5B91A3] uppercase tracking-wider">
                Ordre d'affichage
              </label>
              <select
                value={currentSort}
                onChange={(e) => updateFilter('sort', e.target.value)}
                className="w-full bg-[#131B2B] border border-[#2F4A63] rounded-2xl px-3 py-2 text-xs text-[#CFEAE0] focus:outline-none focus:border-[#CFEAE0] font-medium"
              >
                <option value="newest">Derniers ajouts</option>
                <option value="price_asc">Prix : croissant</option>
                <option value="price_desc">Prix : décroissant</option>
                <option value="title_asc">Titre : A à Z</option>
                <option value="title_desc">Titre : Z à A</option>
              </select>
            </div>

            {/* Special Badges Filter */}
            <div className="space-y-2 pt-2 border-t border-[#2F4A63]/60">
              <span className="text-[10px] font-bold text-[#5B91A3] uppercase tracking-wider">
                Sélection rapide
              </span>
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-xs text-slate-300 hover:text-white cursor-pointer font-medium">
                  <input
                    type="checkbox"
                    checked={currentPromo}
                    onChange={(e) => updateFilter('promo', e.target.checked ? '1' : null)}
                    className="rounded bg-[#131B2B] border-[#2F4A63] text-[#5B91A3] focus:ring-0"
                  />
                  <span>En promotion uniquement</span>
                </label>
                <label className="flex items-center gap-2 text-xs text-slate-300 hover:text-white cursor-pointer font-medium">
                  <input
                    type="checkbox"
                    checked={currentNew}
                    onChange={(e) => updateFilter('new', e.target.checked ? '1' : null)}
                    className="rounded bg-[#131B2B] border-[#2F4A63] text-[#CFEAE0] focus:ring-0"
                  />
                  <span>Nouveautés uniquement</span>
                </label>
              </div>
            </div>

            {/* Platform filter */}
            <div className="space-y-2 pt-2 border-t border-[#2F4A63]/60">
              <span className="text-[10px] font-bold text-[#5B91A3] uppercase tracking-wider">
                Plateforme
              </span>
              <div className="space-y-1">
                <button
                  onClick={() => updateFilter('platform', null)}
                  className={`w-full text-left px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                    !currentPlatform
                      ? 'bg-[#2F4A63] text-[#CFEAE0] border border-[#5B91A3]/40'
                      : 'text-slate-300 hover:bg-[#131B2B]'
                  }`}
                >
                  Toutes les plateformes
                </button>
                {platforms.map((plat) => (
                  <button
                    key={plat.id}
                    onClick={() => updateFilter('platform', plat.slug)}
                    className={`w-full flex items-center justify-between px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                      currentPlatform === plat.slug
                        ? 'bg-[#2F4A63] text-[#CFEAE0] border border-[#5B91A3]/40'
                        : 'text-slate-300 hover:bg-[#131B2B]'
                    }`}
                  >
                    <span>{plat.name}</span>
                    {plat.games_count !== undefined && (
                      <span className="text-[10px] opacity-70 font-mono text-[#5B91A3]">({plat.games_count})</span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Category filter */}
            <div className="space-y-2 pt-2 border-t border-[#2F4A63]/60">
              <span className="text-[10px] font-bold text-[#5B91A3] uppercase tracking-wider">
                Genre
              </span>
              <div className="space-y-1">
                <button
                  onClick={() => updateFilter('category', null)}
                  className={`w-full text-left px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                    !currentCategory
                      ? 'bg-[#2F4A63] text-[#CFEAE0] border border-[#5B91A3]/40'
                      : 'text-slate-300 hover:bg-[#131B2B]'
                  }`}
                >
                  Tous les genres
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => updateFilter('category', cat.slug)}
                    className={`w-full flex items-center justify-between px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                      currentCategory === cat.slug
                        ? 'bg-[#2F4A63] text-[#CFEAE0] border border-[#5B91A3]/40'
                        : 'text-slate-300 hover:bg-[#131B2B]'
                    }`}
                  >
                    <span>{cat.name}</span>
                    {cat.games_count !== undefined && (
                      <span className="text-[10px] opacity-70 font-mono text-[#5B91A3]">({cat.games_count})</span>
                    )}
                  </button>
                ))}
              </div>
            </div>

          </div>
        </aside>

        {/* Games Grid Area */}
        <div className="lg:col-span-3 space-y-8">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <div key={n} className="h-80 rounded-[28px] bg-[#182236] border border-[#2F4A63] animate-pulse" />
              ))}
            </div>
          ) : games.length === 0 ? (
            <div className="py-20 text-center space-y-4 rounded-[28px] bg-[#182236] border border-[#2F4A63]">
              <div className="w-16 h-16 rounded-full bg-[#131B2B] flex items-center justify-center mx-auto text-3xl">
              Aucun produit à afficher
              </div>
              <h3 className="text-base font-bold text-white">Aucun résultat trouvé</h3>
              <p className="text-xs text-[#5B91A3] max-w-sm mx-auto">
                Modifiez ou réinitialisez vos filtres pour voir d'autres titres.
              </p>
              <button
                onClick={resetAllFilters}
                className="btn-primary-mint px-5 py-2 text-xs font-semibold"
              >
                Réinitialiser les filtres
              </button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {games.map((game) => (
                  <GameCard key={game.id} game={game} />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 pt-6">
                  <button
                    disabled={currentPage <= 1}
                    onClick={() => {
                      const next = new URLSearchParams(searchParams);
                      next.set('page', (currentPage - 1).toString());
                      setSearchParams(next);
                    }}
                    className="p-2.5 rounded-full bg-[#182236] border border-[#2F4A63] text-slate-300 hover:border-[#CFEAE0] hover:text-[#CFEAE0] disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-sm"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="px-4 py-2 rounded-full bg-[#182236] border border-[#2F4A63] text-xs font-mono font-bold text-[#CFEAE0] shadow-sm">
                    Page {currentPage} sur {totalPages}
                  </span>
                  <button
                    disabled={currentPage >= totalPages}
                    onClick={() => {
                      const next = new URLSearchParams(searchParams);
                      next.set('page', (currentPage + 1).toString());
                      setSearchParams(next);
                    }}
                    className="p-2.5 rounded-full bg-[#182236] border border-[#2F4A63] text-slate-300 hover:border-[#CFEAE0] hover:text-[#CFEAE0] disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-sm"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </>
          )}
        </div>

      </div>

    </div>
  );
};
