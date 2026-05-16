import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Minus, Plus, Trash2, Send, ShoppingBag } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { formatPKR, cn } from '../../lib/utils';
import { BUSINESS_INFO } from '../../constants';

export const CartDrawer: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const { cart, removeFromCart, updateQuantity, cartTotal, cartCount } = useCart();
  const [customerName, setCustomerName] = React.useState('');
  const [address, setAddress] = React.useState('');

  const sendWhatsAppOrder = () => {
    if (!customerName || !address) {
      alert('Please provide your name and address to proceed.');
      return;
    }

    const productsList = cart.map(item => `- ${item.name} x${item.quantity} (${formatPKR(item.price * item.quantity)})`).join('\n');
    
    const message = `Assalamualaikum,
Mujhe yeh products order karne hain:

${productsList}

Total Items: ${cartCount}
Total Price: ${formatPKR(cartTotal)}

*Customer Details:*
Name: ${customerName}
Address: ${address}

Phone Number: (Customer Phone)`;

    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/${BUSINESS_INFO.whatsapp}?text=${encodedMessage}`, '_blank');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 z-50 h-full w-full max-w-md bg-white shadow-2xl border-l border-slate-200"
          >
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-slate-100">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Order Summary</h3>
                  <p className="text-xs text-slate-500">Review your selected items</p>
                </div>
                <button onClick={onClose} className="p-2 text-slate-400 hover:text-red-500 transition-colors">
                  <X size={24} />
                </button>
              </div>

              {/* Items */}
              <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
                {cart.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
                    <div className="p-6 bg-slate-50 rounded-full text-slate-300">
                      <ShoppingBag size={48} />
                    </div>
                    <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Your cart is empty</p>
                    <button 
                      onClick={onClose}
                      className="text-orange-600 font-black uppercase text-[10px] tracking-widest hover:underline"
                    >
                      Browse Catalog
                    </button>
                  </div>
                ) : (
                  cart.map((item) => (
                    <div key={item.id} className="flex gap-4 group items-center">
                      <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-slate-50 border border-slate-100">
                        <img 
                          src={item.images[0]} 
                          alt={item.name} 
                          className="h-full w-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'https://placehold.co/400x400?text=Dubai+Bazar';
                          }}
                        />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-xs font-bold text-slate-800 line-clamp-1 uppercase tracking-tight">
                          {item.name}
                        </h4>
                        <p className="text-[10px] text-slate-500">1 x {formatPKR(item.price)}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex items-center bg-slate-100 rounded-lg p-1">
                          <button 
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="p-1 text-slate-500 hover:text-slate-900"
                          >
                            <Minus size={12} />
                          </button>
                          <span className="w-6 text-center text-[10px] font-black text-slate-900">{item.quantity}</span>
                          <button 
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="p-1 text-slate-500 hover:text-slate-900"
                          >
                            <Plus size={12} />
                          </button>
                        </div>
                        <button 
                          onClick={() => removeFromCart(item.id)}
                          className="text-slate-300 hover:text-red-500 transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Footer / Checkout Info */}
              {cart.length > 0 && (
                <div className="p-6 bg-slate-50 border-t border-slate-200 space-y-4">
                  <div className="space-y-3">
                    <label className="block">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block ml-1">Your Name</span>
                      <input 
                        type="text" 
                        placeholder="e.g. Ahmed Khan" 
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-orange-500 outline-none transition-all font-medium"
                      />
                    </label>
                    <label className="block">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block ml-1">Shipping Address</span>
                      <textarea 
                        placeholder="e.g. House 123, Block A, North Nazimabad..." 
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        rows={2}
                        className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-orange-500 outline-none transition-all font-medium resize-none"
                      />
                    </label>
                  </div>

                  <div className="space-y-2 pt-4 border-t border-slate-200">
                    <div className="flex justify-between items-center text-xs text-slate-500 font-bold uppercase tracking-widest">
                      <span>Subtotal</span>
                      <span>{formatPKR(cartTotal)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-black text-slate-900 tracking-tight uppercase">Total Amount</span>
                      <span className="text-2xl font-black text-orange-600 tracking-tight">{formatPKR(cartTotal)}</span>
                    </div>
                  </div>
                  
                  <button 
                    onClick={sendWhatsAppOrder}
                    className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-3 shadow-md shadow-green-200 transition-all active:scale-95"
                  >
                    <Send size={20} />
                    Order on WhatsApp
                  </button>
                  <p className="text-[10px] text-center text-slate-400 uppercase tracking-widest font-black">
                    Secure • Fast Delivery • Cash on Delivery
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
