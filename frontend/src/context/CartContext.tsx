import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { CartState, CartItem } from '../types';
import { cartApi } from '../services/api';

interface CartContextType {
  cart: CartState;
  loading: boolean;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  addToCart: (gameId: number, quantity?: number) => Promise<void>;
  updateQuantity: (cartItemId: number, quantity: number) => Promise<void>;
  removeFromCart: (cartItemId: number) => Promise<void>;
  clearCart: () => Promise<void>;
  refreshCart: () => Promise<void>;
  toastMessage: string | null;
}

const initialCart: CartState = {
  items: [],
  totalPrice: 0,
  totalCount: 0,
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartState>(initialCart);
  const [loading, setLoading] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 3000);
  };

  const refreshCart = useCallback(async () => {
    try {
      const res = await cartApi.get();
      if (res.success && res.cart) {
        setCart(res.cart);
      }
    } catch (err) {
      console.warn('Impossible de charger le panier:', err);
    }
  }, []);

  useEffect(() => {
    refreshCart();
  }, [refreshCart]);

  const addToCart = async (gameId: number, quantity: number = 1) => {
    setLoading(true);
    try {
      const res = await cartApi.add(gameId, quantity);
      if (res.success && res.cart) {
        setCart(res.cart);
        showToast('Article ajouté au panier.');
      }
    } catch (err: any) {
      showToast(err.message || "Impossible d'ajouter cet article.");
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (cartItemId: number, quantity: number) => {
    try {
      const res = await cartApi.update(cartItemId, quantity);
      if (res.success && res.cart) {
        setCart(res.cart);
      }
    } catch (err: any) {
      showToast(err.message || 'Impossible de modifier la quantité.');
    }
  };

  const removeFromCart = async (cartItemId: number) => {
    try {
      const res = await cartApi.remove(cartItemId);
      if (res.success && res.cart) {
        setCart(res.cart);
        showToast('Article retiré');
      }
    } catch (err: any) {
      showToast(err.message || 'Impossible de supprimer cet article.');
    }
  };

  const clearCart = async () => {
    try {
      const res = await cartApi.clear();
      if (res.success && res.cart) {
        setCart(res.cart);
      }
    } catch (err: any) {
      showToast(err.message || 'Impossible de vider le panier.');
    }
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        loading,
        isCartOpen,
        setIsCartOpen,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        refreshCart,
        toastMessage,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart doit être utilisé dans un CartProvider');
  }
  return context;
};
