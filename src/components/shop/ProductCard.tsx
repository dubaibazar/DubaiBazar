import React from 'react';
import { ShoppingCart, Eye, Send, CheckCircle2, History } from 'lucide-react';
import { Product } from '../../types';
import { formatPKR, cn } from '../../lib/utils';
import { useCart } from '../../context/CartContext';
import { motion } from 'motion/react';
import { BUSINESS_INFO } from '../../constants';
import { incrementProductViews } from '../../lib/db';

interface ProductCardProps {
  product: Product;
  onQuickView: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onQuickView }) => {
  const { addToCart } = useCart();
  const [isHovered, setIsHovered] = React.useState(false);

  const handleWhatsAppInstant = (e: React.MouseEvent) => {
    e.stopPropagation();
    const message = `Assalamualaikum, mujhe is product ke bare mein puchna hai: ${product.name}\n\nPrice: ${formatPKR(product.price)}\nURL: ${window.location.origin}/product/${product.id}`;
    window.open(`https://wa.me/${BUSINESS_INFO.whatsapp}?text=${encodeURIComponent(message)}`, '_blank');
  };

  const trackView = () => {
    // 1. Maintain local history (in real app, this could also update local badge)
    const views = JSON.parse(localStorage.getItem('viewer-activity') || '{}');
    views[product.id] = (views[product.id] || 0) + 1;
    localStorage.setItem('viewer-activity', JSON.stringify(views));
    
    // 2. Track in DB real-time
    incrementProductViews(product.id);
  };

  const handleQuickView = () => {
    trackView();
    onQuickView(product);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      className="group relative bg-white border border-slate-100 rounded-xl overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-orange-500/5 shadow-sm"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Badges */}
      <div className="absolute top-3 left-3 z-10 flex flex-col gap-1.5">
        {product.isFeatured && (
          <span className="bg-orange-600 text-white text-[10px] font-black px-2 py-0.5 rounded shadow-sm uppercase tracking-widest">
            New
          </span>
        )}
        {product.isTrending && (
          <span className="bg-red-500 text-white text-[10px] font-black px-2 py-0.5 rounded shadow-sm uppercase tracking-widest">
            Sale
          </span>
        )}
      </div>

      {/* Image Container */}
      <div className="relative aspect-square overflow-hidden bg-slate-50">
        <img
          src={product.images[0]}
          alt={product.name}
          className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
          onError={(e) => {
            (e.target as HTMLImageElement).src = 'https://placehold.co/600x600?text=Dubai+Bazar';
          }}
        />
        
        {/* Overlay Actions */}
        <div className={cn(
          "absolute inset-0 bg-slate-900/10 flex items-center justify-center gap-2 transition-opacity duration-300",
          isHovered ? "opacity-100" : "opacity-0"
        )}>
          <button
            onClick={handleQuickView}
            className="p-3 bg-white text-slate-900 rounded-full hover:bg-orange-600 hover:text-white transition-all transform translate-y-4 group-hover:translate-y-0 shadow-lg"
            title="Quick View"
          >
            <Eye size={18} />
          </button>
          <button
            onClick={() => addToCart(product)}
            disabled={product.stockStatus === 'out-of-stock'}
            className="p-3 bg-white text-slate-900 rounded-full hover:bg-orange-600 hover:text-white transition-all transform translate-y-4 group-hover:translate-y-0 delay-75 shadow-lg disabled:opacity-50"
            title="Add to Cart"
          >
            <ShoppingCart size={18} />
          </button>
        </div>
      </div>

      {/* Info */}
      <div className="p-4">
        <h3 className="font-bold text-slate-800 line-clamp-1 group-hover:text-orange-600 transition-colors uppercase tracking-tight text-sm">
          {product.name}
        </h3>
        <p className="text-[10px] text-slate-500 mt-1 uppercase font-bold tracking-widest line-clamp-1">
          {product.category} • {product.description.split('.')[0]}
        </p>
        
        <div className="mt-4 flex items-center justify-between gap-2">
          <span className="text-lg font-black text-orange-600 tracking-tight">
            {formatPKR(product.price)}
          </span>
          <div className="flex gap-1">
            <button
              onClick={handleWhatsAppInstant}
              className="p-2 bg-slate-50 text-green-600 hover:bg-green-600 hover:text-white rounded-lg transition-all"
              title="Ask on WhatsApp"
            >
              <Send size={16} />
            </button>
            <button
              onClick={() => addToCart(product)}
              disabled={product.stockStatus === 'out-of-stock'}
              className="p-2 bg-slate-100 text-slate-600 hover:bg-orange-600 hover:text-white rounded-lg transition-all disabled:opacity-50"
              title="Add to Cart"
            >
              <ShoppingCart size={16} />
            </button>
          </div>
        </div>

        {/* Mobile-Friendly Quick View Only */}
        <div className="mt-4 md:hidden">
          <button
            onClick={handleQuickView}
            className="w-full py-2 bg-slate-50 text-slate-900 rounded-xl text-[10px] uppercase font-black tracking-widest border border-slate-100 active:scale-95 transition-transform"
          >
            View Details
          </button>
        </div>
      </div>
    </motion.div>
  );
};
