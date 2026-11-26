import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Package, Clock, CheckCircle, Truck, XCircle, ArrowLeft, Search, AlertCircle, RefreshCw, ShoppingBag } from 'lucide-react';
import { Order } from '../types';
import { ordersApi } from '../services/api';
import { useAuth } from '../context/AuthContext';

const statusBadges: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
  pending: { label: 'En attente', icon: <Clock className="w-3 h-3" />, color: 'bg-[#2F4A63]/60 text-amber-300 border-amber-400/40' },
  processing: { label: 'En cours', icon: <Clock className="w-3 h-3" />, color: 'bg-[#2F4A63]/60 text-sky-300 border-sky-400/40' },
  shipped: { label: 'Expédié', icon: <Truck className="w-3 h-3" />, color: 'bg-[#2F4A63]/60 text-purple-300 border-purple-400/40' },
  delivered: { label: 'Livré & Confirmé', icon: <CheckCircle className="w-3 h-3" />, color: 'bg-[#2F4A63]/60 text-[#CFEAE0] border-[#CFEAE0]/40' },
  cancelled: { label: 'Annulé', icon: <XCircle className="w-3 h-3" />, color: 'bg-[#2F4A63]/60 text-rose-300 border-rose-400/40' },
};

export const OrdersPage: React.FC = () => {
  const { isAuthenticated, setIsAuthModalOpen } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    if (!isAuthenticated) return;
    const fetchOrders = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await ordersApi.getAll();
        if (res.success) {
          setOrders(res.orders);
        } else {
          setError(res.message || 'Impossible de charger vos commandes.');
        }
      } catch (err) {
        console.error(err);
        setError(err instanceof Error ? err.message : 'Impossible de charger vos commandes.');
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [isAuthenticated, refreshKey]);

  const pendingCount = orders.filter((order) => order.status === 'pending').length;
  const activeCount = orders.filter((order) => ['processing', 'shipped'].includes(order.status)).length;
  const completeCount = orders.filter((order) => order.status === 'delivered').length;
  const visibleOrders = orders.filter((order) => {
    const statusMatches = statusFilter === 'all' ||
      (statusFilter === 'active' ? ['processing', 'shipped'].includes(order.status) : order.status === statusFilter);
    const query = search.trim().toLocaleLowerCase('fr');
    const searchMatches = !query || String(order.id).includes(query) ||
      order.items?.some((item) => item.title.toLocaleLowerCase('fr').includes(query));
    return statusMatches && searchMatches;
  });

  if (!isAuthenticated) {
    return (
      <div className="surface-panel mx-auto max-w-md space-y-4 rounded-[28px] p-8 text-center">
        <div className="w-16 h-16 rounded-full bg-[#131B2B] flex items-center justify-center mx-auto text-[#5B91A3]">
          <Package className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-white tracking-tight">Connexion requise</h2>
        <p className="text-xs text-[#5B91A3]">Connectez votre compte pour voir l'historique de vos commandes et vos clés.</p>
        <button
          onClick={() => setIsAuthModalOpen(true)}
          className="btn-primary-mint px-6 py-2.5 text-xs"
        >
          Se connecter
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl space-y-8 pb-16">
      <div className="flex flex-col gap-4 border-b border-white/10 pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="eyebrow mb-2">Votre espace A2SIL</p>
          <h1 className="page-heading flex items-center gap-2.5 text-white">
            Mes commandes
          </h1>
          <p className="mt-2 text-sm text-[#b4c4c9]">
            Consultez le statut et les articles de chaque commande.
          </p>
        </div>
        <Link
          to="/shop"
          className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.035] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/[0.07]"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Boutique
        </Link>
      </div>

      <section aria-label="Résumé des commandes" className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {[
          { label: 'En attente', count: pendingCount, color: 'text-amber-200', key: 'pending' },
          { label: 'En cours', count: activeCount, color: 'text-sky-200', key: 'active' },
          { label: 'Terminées', count: completeCount, color: 'text-[#CFEAE0]', key: 'delivered' },
        ].map((metric) => (
          <button key={metric.key} type="button" onClick={() => setStatusFilter(metric.key)} className="surface-subtle flex items-center justify-between rounded-2xl p-4 text-left transition hover:bg-white/[0.055]">
            <span className="text-sm text-[#b4c4c9]">{metric.label}</span>
            <span className={`text-xl font-bold ${metric.color}`}>{metric.count}</span>
          </button>
        ))}
      </section>

      <div className="surface-panel flex flex-col gap-4 rounded-[24px] p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
        <div className="flex flex-wrap gap-2" role="group" aria-label="Filtrer les commandes par statut">
          {[
            { key: 'all', label: `Toutes · ${orders.length}` },
            { key: 'pending', label: 'En attente' },
            { key: 'active', label: 'En cours' },
            { key: 'delivered', label: 'Terminées' },
            { key: 'cancelled', label: 'Annulées' },
          ].map((filter) => (
            <button key={filter.key} type="button" onClick={() => setStatusFilter(filter.key)} aria-pressed={statusFilter === filter.key} className={`rounded-xl px-3 py-2 text-xs font-semibold transition ${statusFilter === filter.key ? 'bg-[#CFEAE0] text-[#131B2B]' : 'text-[#b4c4c9] hover:bg-white/[0.06] hover:text-white'}`}>
              {filter.label}
            </button>
          ))}
        </div>
        <label className="relative w-full sm:max-w-xs">
          <span className="sr-only">Rechercher une commande ou un produit</span>
          <Search className="absolute left-3 top-3 h-4 w-4 text-[#8ba8b4]" />
          <input type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Commande ou produit" className="w-full rounded-xl border border-white/10 bg-[#131B2B] py-2.5 pl-9 pr-3 text-sm text-white placeholder:text-[#8ba8b4]" />
        </label>
      </div>

      {error ? (
        <div role="alert" className="surface-panel rounded-[28px] px-6 py-14 text-center">
          <AlertCircle className="mx-auto h-9 w-9 text-rose-300" />
          <h2 className="mt-4 text-lg font-bold text-white">Vos commandes ne sont pas disponibles</h2>
          <p className="mt-2 text-sm text-[#b4c4c9]">{error}</p>
          <button type="button" onClick={() => setRefreshKey((key) => key + 1)} className="btn-primary-mint mt-5 inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm"><RefreshCw className="h-4 w-4" /> Réessayer</button>
        </div>
      ) : loading ? (
        <div className="space-y-4" aria-label="Chargement des commandes" aria-busy="true">
          {[1, 2].map((item) => <div key={item} className="h-44 animate-pulse rounded-[24px] border border-white/10 bg-white/[0.035]" />)}
        </div>
      ) : orders.length === 0 ? (
        <div className="surface-panel space-y-3 rounded-[28px] px-6 py-16 text-center">
          <ShoppingBag className="mx-auto h-9 w-9 text-[#8ba8b4]" />
          <h3 className="text-base font-bold text-white">Aucune commande pour le moment</h3>
          <p className="text-xs text-[#5B91A3] max-w-xs mx-auto">
            Vos prochaines commandes apparaîtront ici.
          </p>
          <Link
            to="/shop"
            className="btn-primary-mint inline-block mt-2 px-5 py-2 text-xs font-semibold"
          >
            Découvrir les jeux
          </Link>
        </div>
      ) : visibleOrders.length === 0 ? (
        <div className="surface-panel space-y-3 rounded-[28px] px-6 py-14 text-center">
          <Search className="mx-auto h-8 w-8 text-[#8ba8b4]" />
          <h2 className="text-base font-bold text-white">Aucune commande correspondante</h2>
          <p className="text-sm text-[#b4c4c9]">Essayez un autre statut ou un autre mot-clé.</p>
          <button type="button" onClick={() => { setStatusFilter('all'); setSearch(''); }} className="quiet-link text-sm font-semibold">Effacer les filtres</button>
        </div>
      ) : (
        <div className="space-y-4">
          {visibleOrders.map((order) => {
            const badge = statusBadges[order.status] || statusBadges['pending'];
            const total = typeof order.total === 'string' ? parseFloat(order.total) : order.total;

            return (
              <div
                key={order.id}
                className="card-brand space-y-4 rounded-[24px] p-5 sm:p-6"
              >
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#2F4A63]/60 pb-3">
                  <div className="space-y-1">
                    <span className="flex items-center gap-2 text-sm font-bold tracking-tight text-white">
                      Commande #{order.id}
                    </span>
                    <p className="text-xs text-[#8ba8b4]">
                      Passée le {new Date(order.created_at).toLocaleDateString('fr-FR', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold border ${badge.color}`}>
                      {badge.icon}
                      {badge.label}
                    </span>
                    <span className="text-base font-extrabold text-[#CFEAE0]">
                      {total.toFixed(2)} DH
                    </span>
                  </div>
                </div>

                {/* Items */}
                {order.items && order.items.length > 0 && (
                  <div className="grid gap-2 sm:grid-cols-2">
                    {order.items.map((it) => (
                      <div key={it.id} className="flex items-center justify-between gap-3 rounded-xl border border-white/[0.06] bg-white/[0.025] px-3 py-3 text-xs">
                        <div className="flex items-center gap-2">
                          <Package className="w-4 h-4 text-[#5B91A3]" />
                          <span className="text-white font-bold">{it.title}</span>
                          <span className="text-[#5B91A3] font-mono">× {it.quantity}</span>
                        </div>
                        <span className="text-[#CFEAE0] font-mono font-bold">
                          {(parseFloat(it.unit_price as string) * it.quantity).toFixed(2)} DH
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex flex-col gap-1 border-t border-white/[0.08] pt-3 text-xs text-[#8ba8b4] sm:flex-row sm:items-center sm:justify-between">
                  <span>E-mail : {order.shipping_address}</span>
                  <span className="font-mono">Paiement : {order.payment_method || 'À confirmer'}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
