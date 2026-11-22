import React, { useState } from 'react';
import { X, ShoppingBag, Plus, Minus, Trash2, ArrowRight, ShieldCheck, CheckCircle2, Gamepad2 } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { ordersApi } from '../services/api';

export const CartDrawer: React.FC = () => {
  const { cart, isCartOpen, setIsCartOpen, updateQuantity, removeFromCart, clearCart, refreshCart } = useCart();
  const { isAuthenticated, setIsAuthModalOpen } = useAuth();
  
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [shippingAddress, setShippingAddress] = useState('');
  const [orderSubmitting, setOrderSubmitting] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState<{ id: number; total: number } | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isCartOpen) return null;

  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!shippingAddress.trim()) {
      setErrorMsg('Veuillez renseigner votre e-mail de réception.');
      return;
    }

    setOrderSubmitting(true);
    setErrorMsg('');
    try {
      const res = await ordersApi.create({
        shipping_address: shippingAddress,
        payment_method: 'À confirmer',
      });

      if (res.success) {
        setOrderSuccess({ id: res.order_id, total: res.total });
        setIsCheckingOut(false);
        refreshCart();
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Erreur lors de la validation');
    } finally {
      setOrderSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-md transition-opacity"
        onClick={() => setIsCartOpen(false)}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-6 sm:pl-10">
        <div className="w-screen max-w-md bg-[#131B2B] border-l border-[#2F4A63] shadow-2xl flex flex-col">
          
          {/* Header */}
          <div className="p-6 border-b border-[#2F4A63] bg-[#182236] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-[#2F4A63] flex items-center justify-center text-[#CFEAE0]">
                <ShoppingBag className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-base font-extrabold text-white tracking-tight">
                  Votre Panier
                </h2>
                <span className="text-[11px] font-medium text-[#5B91A3]">
                  {cart.totalCount} {cart.totalCount > 1 ? 'articles sélectionnés' : 'article sélectionné'}
                </span>
              </div>
            </div>
            <button
              onClick={() => setIsCartOpen(false)}
              className="p-2 rounded-full text-[#5B91A3] hover:text-white hover:bg-[#2F4A63] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            
            {orderSuccess ? (
              <div className="py-12 text-center space-y-4 bg-[#182236] p-6 rounded-[28px] border border-[#2F4A63]">
                <div className="w-16 h-16 rounded-full bg-[#2F4A63]/60 text-[#CFEAE0] border border-[#5B91A3] mx-auto flex items-center justify-center">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-extrabold text-white tracking-tight">Commande Confirmée !</h3>
                <p className="text-xs text-slate-300 leading-relaxed max-w-xs mx-auto">
                  Votre commande <span className="font-mono font-bold text-[#CFEAE0]">#{orderSuccess.id}</span> d'un montant de <span className="font-mono font-bold text-[#CFEAE0]">{orderSuccess.total.toFixed(2)} DH</span> a été enregistrée avec succès.
                </p>
                <button
                  onClick={() => {
                    setOrderSuccess(null);
                    setIsCartOpen(false);
                  }}
                  className="btn-primary-mint mt-4 px-6 py-2.5 text-xs"
                >
                  Continuer les achats
                </button>
              </div>
            ) : isCheckingOut ? (
              /* Checkout Form */
              <form onSubmit={handleCheckoutSubmit} className="space-y-4 bg-[#182236] p-5 rounded-[28px] border border-[#2F4A63]">
                <div className="flex items-center justify-between pb-2 border-b border-[#2F4A63]">
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider">Finaliser l'achat</h3>
                  <button
                    type="button"
                    onClick={() => setIsCheckingOut(false)}
                    className="text-xs text-[#CFEAE0] hover:underline font-semibold"
                  >
                    ← Modifier le panier
                  </button>
                </div>

                {errorMsg && (
                  <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
                    {errorMsg}
                  </div>
                )}

                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    E-mail de réception
                  </label>
                  <input
                    type="email"
                    required
                    value={shippingAddress}
                    onChange={(e) => setShippingAddress(e.target.value)}
                    placeholder="Votre e-mail de réception..."
                    className="w-full bg-[#131B2B] border border-[#2F4A63] focus:border-[#CFEAE0] rounded-2xl p-3 text-xs text-[#CFEAE0] placeholder-[#5B91A3] focus:outline-none transition-all"
                  />
                </div>

                {/* Order summary */}
                <div className="p-4 rounded-2xl bg-[#131B2B] border border-[#2F4A63] space-y-2 text-xs">
                  <div className="flex justify-between text-[#5B91A3]">
                    <span>Sous-total ({cart.totalCount} articles)</span>
                    <span className="font-mono font-bold text-white">{cart.totalPrice.toFixed(2)} DH</span>
                  </div>
                  <div className="flex justify-between text-[#5B91A3]">
                    <span>Livraison</span>
                    <span className="text-[#CFEAE0] font-bold">Gratuite</span>
                  </div>
                  <div className="border-t border-[#2F4A63] pt-2 flex justify-between font-extrabold text-sm">
                    <span className="text-white">Total de la commande</span>
                    <span className="text-[#CFEAE0] font-mono">{cart.totalPrice.toFixed(2)} DH</span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={orderSubmitting}
                  className="btn-primary-mint w-full py-3.5 rounded-full font-bold text-xs flex items-center justify-center gap-2 cursor-pointer"
                >
                  <ShieldCheck className="w-4 h-4 text-[#131B2B]" />
                  {orderSubmitting ? 'Validation...' : `Confirmer la commande — ${cart.totalPrice.toFixed(2)} DH`}
                </button>
              </form>
            ) : cart.items.length === 0 ? (
              /* Empty Cart */
              <div className="py-16 text-center space-y-3 bg-[#182236] p-6 rounded-[28px] border border-[#2F4A63]">
                <div className="w-16 h-16 rounded-full bg-[#131B2B] flex items-center justify-center mx-auto text-[#5B91A3]"><ShoppingBag className="w-7 h-7" /></div>
                <h3 className="text-base font-bold text-white">Votre panier est vide</h3>
                <p className="text-xs text-[#5B91A3] max-w-xs mx-auto">
                  Découvrez les nouveautés et les promotions exclusives pour commencer vos achats.
                </p>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="btn-primary-mint px-5 py-2 text-xs font-semibold"
                >
                  Découvrir les jeux
                </button>
              </div>
            ) : (
              /* Cart Items List */
              <>
                <div className="flex items-center justify-between pb-1">
                  <span className="text-[11px] font-bold text-[#5B91A3] uppercase tracking-wider">Vos Articles</span>
                  <button
                    onClick={clearCart}
                    className="text-[11px] text-rose-400 hover:text-rose-300 font-semibold flex items-center gap-1 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Vider le panier
                  </button>
                </div>

                {cart.items.map((item) => (
                  <div
                    key={item.cart_item_id}
                    className="p-4 rounded-[22px] bg-[#182236] border border-[#2F4A63] flex items-center gap-3.5 shadow-sm"
                  >
                    {/* Item Avatar */}
                    <div className="w-14 h-14 rounded-2xl bg-[#131B2B] border border-[#2F4A63] flex items-center justify-center text-xl shrink-0 overflow-hidden">
                      {item.image ? (
                        <img
                          src={item.image.startsWith('http') ? item.image : `/assets/images/${item.image}`}
                          alt={item.title}
                          className="w-full h-full object-cover"
                        />
                      ) : <Gamepad2 className="w-6 h-6 text-[#5B91A3]" />}
                    </div>

                    {/* Details */}
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-bold text-white truncate">{item.title}</h4>
                      <p className="text-[11px] text-[#5B91A3] font-mono mt-0.5">
                        {item.platform_name || 'PC'} • {(typeof item.price === 'string' ? parseFloat(item.price) : item.price).toFixed(2)} DH
                      </p>

                      {/* Quantity Controls */}
                      <div className="flex items-center gap-2 mt-2">
                        <button
                          onClick={() => updateQuantity(item.cart_item_id, item.quantity - 1)}
                          className="w-6 h-6 rounded-full bg-[#131B2B] hover:bg-[#2F4A63] text-[#CFEAE0] flex items-center justify-center text-xs font-bold"
                          title="Diminuer"
                        >
                          <Minus className="w-2.5 h-2.5" />
                        </button>
                        <span className="text-xs font-mono font-bold text-white px-1">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.cart_item_id, item.quantity + 1)}
                          disabled={item.quantity >= item.stock}
                          className="w-6 h-6 rounded-full bg-[#131B2B] hover:bg-[#2F4A63] text-[#CFEAE0] flex items-center justify-center text-xs font-bold disabled:opacity-40"
                          title="Augmenter"
                        >
                          <Plus className="w-2.5 h-2.5" />
                        </button>
                      </div>
                    </div>

                    {/* Price and delete */}
                    <div className="text-right shrink-0 flex flex-col justify-between items-end h-14">
                      <span className="font-mono font-extrabold text-[#CFEAE0] text-sm">
                        {item.subtotal.toFixed(2)} DH
                      </span>
                      <button
                        onClick={() => removeFromCart(item.cart_item_id)}
                        className="text-[#5B91A3] hover:text-rose-400 transition-colors p-1"
                        title="Supprimer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </>
            )}

          </div>

          {/* Footer / Checkout Button */}
          {!orderSuccess && !isCheckingOut && cart.items.length > 0 && (
            <div className="p-6 border-t border-[#2F4A63] bg-[#182236] space-y-4">
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#5B91A3] font-semibold">Total de la commande</span>
                <span className="text-2xl font-black font-mono text-[#CFEAE0]">
                  {cart.totalPrice.toFixed(2)} DH
                </span>
              </div>

              <button
                onClick={() => {
                  if (!isAuthenticated) {
                    setIsAuthModalOpen(true);
                  } else {
                    setIsCheckingOut(true);
                  }
                }}
                className="btn-primary-mint w-full py-3.5 rounded-full font-bold text-xs flex items-center justify-center gap-2 group cursor-pointer"
              >
                <span>{isAuthenticated ? 'Finaliser la commande' : 'Se connecter pour commander'}</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
