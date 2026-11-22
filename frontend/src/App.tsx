import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { CartProvider, useCart } from './context/CartContext';
import { AuthProvider } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { CartDrawer } from './components/CartDrawer';
import { AuthModal } from './components/AuthModal';
import { HomePage } from './pages/HomePage';
import { ShopPage } from './pages/ShopPage';
import { GameDetailPage } from './pages/GameDetailPage';
import { OrdersPage } from './pages/OrdersPage';

// Store notifications
const GlobalToast: React.FC = () => {
  const { toastMessage } = useCart();
  if (!toastMessage) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="bg-[#182236] text-[#CFEAE0] text-xs font-bold px-5 py-3.5 rounded-full shadow-2xl flex items-center gap-2.5 border border-[#5B91A3]/50 shadow-[0_0_20px_rgba(207,234,224,0.2)]">
        <span className="w-2 h-2 rounded-full bg-[#CFEAE0] shadow-[0_0_8px_#CFEAE0]" />
        <span>{toastMessage}</span>
      </div>
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <CartProvider>
        <BrowserRouter>
          <div className="min-h-screen flex flex-col bg-[#131B2B] text-[#f1f7f5]">
            <Navbar />
            <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-4">
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/shop" element={<ShopPage />} />
                <Route path="/game/:id" element={<GameDetailPage />} />
                <Route path="/orders" element={<OrdersPage />} />
              </Routes>
            </main>
            <Footer />
            <CartDrawer />
            <AuthModal />
            <GlobalToast />
          </div>
        </BrowserRouter>
      </CartProvider>
    </AuthProvider>
  );
};

export default App;
