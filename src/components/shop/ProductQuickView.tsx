import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ShoppingCart, Send, ShieldCheck, Truck, RefreshCw } from 'lucide-react';
import { Product } from '../../types';
import { formatPKR, cn } from '../../lib/utils';
import { useCart } from '../../context/CartContext';
import { BUSINESS_INFO } from '../../constants';

interface ProductQuickViewProps {
  product: Product | null;
  onClose: () => void;
}

export const ProductQuickView: React.FC<ProductQuickViewProps> = ({ product, onClose }) => {
  const { addToCart } = useCart();
  const [selectedImage, setSelectedImage] = React.useState(0);

  if (!product) return null;

  const handleWhatsAppAsk = () => {
    const message = `Assalamualaikum, is product ke bare mein mazeed details chahiye: ${product.name}\nPrice: ${formatPKR(product.price)}`;
    window.open(`https://wa.me/${BUSINESS_INFO.whatsapp}?text=${encodeURIComponent(message)}`, '_blank');
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-4xl max-h-[90vh] bg-white rounded-[2rem] shadow-2xl overflow-hidden flex flex-col md:flex-row border border-slate-200"
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 p-2 bg-slate-50 hover:bg-slate-100 rounded-full text-slate-900 shadow-md transition-colors border border-slate-200"
          >
            <X size={20} />
          </button>

          {/* Left: Images */}
          <div className="w-full md:w-1/2 p-4 md:p-8 bg-slate-50 flex flex-col gap-4">
            <div className="flex-1 aspect-square rounded-2xl overflow-hidden bg-white border border-slate-100 shadow-sm">
              <img
                src={product.images[selectedImage]}
                alt={product.name}
                className="h-full w-full object-contain p-4 transition-transform duration-500 hover:scale-105"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://placehold.co/800x800?text=Dubai+Bazar';
                }}
              />
            </div>
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(idx)}
                  className={cn(
                    "relative h-18 w-18 shrink-0 rounded-xl overflow-hidden border-2 transition-all shadow-sm",
                    selectedImage === idx ? "border-orange-600 ring-2 ring-orange-100" : "border-white opacity-60 hover:opacity-100"
                  )}
                >
                  <img src={img} alt={`${product.name} ${idx + 1}`} className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* Right: Info */}
          <div className="w-full md:w-1/2 p-6 md:p-10 flex flex-col overflow-y-auto bg-white">
            <div className="flex-1">
              <span className="text-[11px] font-black text-orange-600 uppercase tracking-[0.2em] mb-2 block px-2 py-0.5 bg-orange-50 w-fit rounded">
                {product.category}
              </span>
              <h2 className="text-2xl md:text-3xl font-black text-slate-900 uppercase tracking-tight leading-tight mb-4">
                {product.name}
              </h2>
              <div className="flex items-center gap-4 mb-6">
                <span className="text-3xl font-black text-orange-600 tracking-tight">
                  {formatPKR(product.price)}
                </span>
                {product.stockStatus === 'in-stock' ? (
                  <span className="flex items-center gap-1.5 text-green-600 text-[10px] font-black uppercase tracking-widest px-2 py-1 bg-green-50 rounded">
                    <ShieldCheck size={14} /> In Stock
                  </span>
                ) : (
                  <span className="text-red-500 text-[10px] font-black uppercase tracking-widest px-2 py-1 bg-red-50 rounded">
                    Out of Stock
                  </span>
                )}
              </div>

              <div className="space-y-6">
                <div>
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 border-b border-slate-100 pb-2">Description</h4>
                  <p className="text-slate-500 text-sm leading-relaxed font-medium">
                    {product.description}
                  </p>
                </div>

                {Object.keys(product.specifications).length > 0 && (
                  <div>
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 border-b border-slate-100 pb-2">Technical Specs</h4>
                    <div className="grid grid-cols-2 gap-3">
                      {Object.entries(product.specifications).map(([key, value]) => (
                        <div key={key} className="flex flex-col p-3 bg-slate-50 rounded-xl border border-slate-100">
                          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{key}</span>
                          <span className="text-xs font-black text-slate-800">{value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="sticky bottom-0 mt-8 pt-6 border-t border-slate-100 flex flex-col gap-3 bg-white pb-6 md:pb-0">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <button
                  onClick={() => { addToCart(product); onClose(); }}
                  disabled={product.stockStatus === 'out-of-stock'}
                  className="bg-orange-600 hover:bg-orange-700 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-3 transition-all shadow-lg shadow-orange-200 active:scale-95 disabled:opacity-50"
                >
                  <ShoppingCart size={20} />
                  Add to Cart
                </button>
                <button
                  onClick={handleWhatsAppAsk}
                  className="bg-white border-2 border-green-500 text-green-600 font-bold py-4 rounded-xl flex items-center justify-center gap-3 transition-all hover:bg-green-50 active:scale-95 shadow-sm"
                >
                  <Send size={20} />
                  Ask on WhatsApp
                </button>
              </div>

              <div className="grid grid-cols-3 gap-2 mt-4">
                <div className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <Truck size={14} className="text-slate-400" />
                  <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest text-center">Fast Delivery</span>
                </div>
                <div className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <ShieldCheck size={14} className="text-slate-400" />
                  <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest text-center">Protected</span>
                </div>
                <div className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <RefreshCw size={14} className="text-slate-400" />
                  <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest text-center">7 Day Return</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
