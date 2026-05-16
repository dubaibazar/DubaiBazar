import React from 'react';
import { ShoppingCart, User, Phone, Menu, X, ArrowRight } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { motion, AnimatePresence } from 'motion/react';
import { BUSINESS_INFO } from '../../constants';

import { Logo } from './Logo';

export const Header: React.FC<{ onOpenCart: () => void }> = ({ onOpenCart }) => {
  const { cartCount } = useCart();
  const { isAdmin } = useAuth();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white shadow-sm">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="group">
            <Logo size="md" />
          </Link>

          {/* Actions */}
          <div className="flex items-center gap-2 md:gap-6">
            <Link
              to={isAdmin ? "/admin" : "/login"}
              className="flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-orange-600 transition-colors"
              title="Admin"
            >
              <User size={20} className="md:w-5 md:h-5 w-4 h-4" />
              <span className="hidden lg:inline">Admin</span>
            </Link>
            
            <button
              onClick={onOpenCart}
              className="relative p-2 bg-orange-50 rounded-full text-orange-600 hover:bg-orange-100 transition-all active:scale-95"
            >
              <ShoppingCart size={20} className="md:w-6 md:h-6 w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white border-2 border-white">
                  {cartCount}
                </span>
              )}
            </button>

            <button
              className="md:hidden p-2 text-gray-500"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-gray-100 bg-white overflow-hidden"
          >
            <div className="flex flex-col p-4 gap-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Need help?</span>
                <a
                  href={`https://wa.me/${BUSINESS_INFO.whatsapp}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 text-sm font-semibold text-green-600"
                >
                  <Phone size={16} />
                  WhatsApp
                </a>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};
