import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { CartDrawer } from './components/layout/CartDrawer';
import { Home } from './pages/Home';
import { Login } from './pages/Login';
import { AdminDashboard } from './pages/AdminDashboard';
import { motion, AnimatePresence } from 'motion/react';

import { SEOEffect } from './components/SEOEffect';

const MainLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const location = useLocation();

  return (
    <div className="min-h-screen flex flex-col font-sans text-gray-900 overflow-x-hidden">
      <SEOEffect />
      <Header onOpenCart={() => setIsCartOpen(true)} />
      <main className="flex-1">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>
      <Footer />
      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
      
      {/* WhatsApp Sticky Button (Mobile) */}
      <a 
        href="https://wa.me/03073992661"
        target="_blank"
        rel="noreferrer"
        className="fixed bottom-6 right-6 z-30 md:hidden bg-green-500 text-white p-4 rounded-full shadow-2xl active:scale-90 transition-transform"
      >
        <svg fill="currentColor" viewBox="0 0 24 24" className="w-6 h-6">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.411 0 .01 5.403.007 12.04c0 2.123.554 4.197 1.606 6.064L0 24l6.135-1.61a11.75 11.75 0 005.911 1.589h.005c6.637 0 12.038-5.402 12.04-12.04a11.75 11.75 0 00-3.528-8.513z"/>
        </svg>
      </a>
      
      {/* Sticky Bottom Nav (Mobile) */}
      <nav className="fixed bottom-0 left-0 right-0 z-20 md:hidden bg-white/90 backdrop-blur-lg border-t border-gray-100 flex items-center justify-around h-16 px-4 pb-2">
        <button className="flex flex-col items-center gap-1 text-orange-600 font-black tracking-tighter">
          <span className="text-xs uppercase">Store</span>
        </button>
        <button onClick={() => setIsCartOpen(true)} className="relative flex flex-col items-center gap-1 text-gray-400 font-bold tracking-tighter">
          <span className="text-xs uppercase">Cart</span>
          <span className="absolute -top-1 -right-1 bg-orange-600 text-white text-[8px] h-3 w-3 flex items-center justify-center rounded-full">!</span>
        </button>
      </nav>
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <BrowserRouter>
          <MainLayout>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </MainLayout>
        </BrowserRouter>
      </CartProvider>
    </AuthProvider>
  );
}
