import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Package, Clock, CheckCircle, Truck, XCircle, ArrowLeft } from 'lucide-react';
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

  useEffect(() => {
    if (!isAuthenticated) return;
    const fetchOrders = async () => {
      try {
        const res = await ordersApi.getAll();
        if (res.success) {
          setOrders(res.orders);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return (
      <div className="py-24 text-center space-y-4 bg-[#182236] p-8 rounded-[32px] border border-[#2F4A63] max-w-md mx-auto">
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
    <div className="space-y-8 pb-20 max-w-4xl mx-auto">
      <div className="flex items-end justify-between border-b border-[#2F4A63]/60 pb-6">
        <div>
          <h1 className="text-3xl text-white flex items-center gap-2.5 font-dream-title">
            <Package className="w-7 h-7 text-[#CFEAE0]" />
            Mes commandes
          </h1>
          <p className="text-xs text-[#5B91A3] mt-1 font-mono">
            {orders.length} {orders.length > 1 ? 'commandes enregistrées' : 'commande enregistrée'}
          </p>
        </div>
        <Link
          to="/shop"
          className="text-xs font-bold text-[#CFEAE0] hover:underline flex items-center gap-1"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Boutique
        </Link>
      </div>

      {loading ? (
        <div className="py-20 flex justify-center">
          <div className="w-8 h-8 border-3 border-[#CFEAE0] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : orders.length === 0 ? (
        <div className="py-20 text-center space-y-3 bg-[#182236] border border-[#2F4A63] rounded-[28px]">
          <Package className="w-9 h-9 text-[#5B91A3] mx-auto" />
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
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const badge = statusBadges[order.status] || statusBadges['pending'];
            const total = typeof order.total === 'string' ? parseFloat(order.total) : order.total;

            return (
              <div
                key={order.id}
                className="p-6 rounded-[28px] bg-[#182236] border border-[#2F4A63] shadow-sm space-y-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#2F4A63]/60 pb-3">
                  <div className="space-y-0.5">
                    <span className="text-sm font-bold text-white font-mono tracking-tight flex items-center gap-2">
                      Commande #{order.id}
                    </span>
                    <p className="text-[11px] text-[#5B91A3] font-mono">
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
                    <span className="text-base font-extrabold text-[#CFEAE0] font-mono">
                      {total.toFixed(2)} DH
                    </span>
                  </div>
                </div>

                {/* Items */}
                {order.items && order.items.length > 0 && (
                  <div className="space-y-2">
                    {order.items.map((it) => (
                      <div key={it.id} className="flex items-center justify-between text-xs py-2 border-b border-[#2F4A63]/30 last:border-0">
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

                <div className="text-[11px] text-[#5B91A3] flex items-center justify-between pt-1">
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
