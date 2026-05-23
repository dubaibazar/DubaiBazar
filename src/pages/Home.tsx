import React, { useEffect, useState } from 'react';
import { getProducts, incrementSiteViews } from '../lib/db';
import { Product } from '../types';
import { ProductCard } from '../components/shop/ProductCard';
import { ProductQuickView } from '../components/shop/ProductQuickView';
import { Logo } from '../components/layout/Logo';
import { motion } from 'motion/react';
import { Sparkles, TrendingUp, Filter, Search, ArrowRight, MessageCircle } from 'lucide-react';
import { BUSINESS_INFO } from '../constants';
import { cn } from '../lib/utils';

export const Home: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      const data = await getProducts();
      setProducts(data);
      setIsLoading(false);
    };
    fetchProducts();
    // Track site-wide views in real-time on every landing page visit/reload
    incrementSiteViews();
  }, []);

  const categories = ['All', ...new Set(products.map(p => p.category))];

  const filteredProducts = products.filter(p => {
    const matchesCategory = activeCategory === 'All' || p.category === activeCategory;
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         p.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const featuredProducts = products.filter(p => p.isFeatured).slice(0, 3);

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      {/* Hero Section */}
      <section className="pt-8 pb-12">
        <div className="container mx-auto px-4 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="relative bg-gradient-to-r from-orange-600 to-red-700 md:h-64 rounded-3xl p-8 md:p-12 overflow-hidden shadow-xl shadow-orange-500/10"
          >
            <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-8 h-full">
              <div className="max-w-2xl">
                <div className="lg:hidden mb-6 flex items-center gap-3">
                  <div className="p-3 bg-white rounded-2xl shadow-lg">
                    <Logo size="md" showText={false} />
                  </div>
                  <span className="text-xl text-white font-black tracking-tighter uppercase">Dubai Bazar</span>
                </div>
                <span className="px-2 py-1 bg-white/20 backdrop-blur-md rounded text-[10px] font-bold text-white uppercase tracking-widest border border-white/10">
                  Flash Sale • New Arrival
                </span>
                <h1 className="text-3xl md:text-6xl font-black text-white mt-4 leading-tight uppercase tracking-tight">
                  Dubai Bazar
                </h1>
                <p className="text-white/80 mt-4 text-sm md:text-base max-w-lg leading-relaxed font-medium">
                  Located at Jackson Bazar, Kemari. Premium gadgets, gaming accessories, and collectibles delivered to your door.
                </p>
                <div className="mt-6 flex flex-wrap gap-4">
                  <a href="#shop" className="px-6 py-3 bg-white text-orange-600 rounded-xl font-bold text-sm hover:scale-105 transition-transform">
                    Shop Catalog
                  </a>
                </div>
              </div>

              <motion.div 
                initial={{ opacity: 0, scale: 0.8, rotate: -5 }}
                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                transition={{ delay: 0.3, duration: 0.8 }}
                className="hidden lg:block lg:mr-12"
              >
                <div className="p-4 bg-white rounded-[2.5rem] shadow-2xl shadow-black/20">
                  <Logo size="xl" showText={false} />
                </div>
              </motion.div>
            </div>
            {/* Abstract Shapes */}
            <div className="absolute right-[-100px] top-[-50px] w-96 h-96 bg-white/10 rounded-full blur-3xl" />
            <div className="absolute left-[20%] bottom-[-50px] w-64 h-64 bg-red-500/20 rounded-full blur-2xl" />
          </motion.div>
        </div>
      </section>

      {/* Main Shop Area */}
      <section id="shop" className="py-8">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 md:p-10 shadow-sm">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10 pb-10 border-b border-slate-100">
              <div>
                <h3 className="text-xs font-black text-orange-600 uppercase tracking-widest mb-2">Inventory</h3>
                <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tight flex items-center gap-3">
                  Full Catalog
                  <span className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded-lg border border-slate-200 font-bold">
                    {filteredProducts.length}
                  </span>
                </h2>
              </div>

              <div className="flex flex-col md:flex-row gap-4 flex-1 max-w-2xl">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input 
                    type="text" 
                    placeholder="Search gadgets, toys, and tech..." 
                    className="w-full pl-12 pr-4 py-3 bg-slate-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-orange-500 transition-all outline-none font-medium"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
                  {categories.map(cat => (
                    <button
                      key={cat}
                      onClick={() => setActiveCategory(cat)}
                      className={cn(
                        "px-5 py-3 rounded-2xl text-xs font-bold whitespace-nowrap transition-all uppercase tracking-widest border",
                        activeCategory === cat 
                          ? "bg-orange-600 text-white border-orange-600 shadow-lg shadow-orange-200" 
                          : "bg-white text-slate-500 border-slate-200 hover:bg-slate-50"
                      )}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6 animate-pulse">
                {[1,2,3,4,5,6,7,8,9,10].map(i => (
                  <div key={i} className="aspect-[4/5] bg-slate-100 rounded-2xl" />
                ))}
              </div>
            ) : filteredProducts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6 md:gap-8">
                {filteredProducts.map(product => (
                  <ProductCard 
                    key={product.id} 
                    product={product} 
                    onQuickView={setSelectedProduct} 
                  />
                ))}
              </div>
            ) : (
              <div className="py-32 text-center">
                <Search size={48} className="mx-auto text-slate-200 mb-4" />
                <p className="text-slate-400 font-bold uppercase tracking-widest">No products found for "{searchQuery}"</p>
                <button 
                  onClick={() => { setSearchQuery(''); setActiveCategory('All'); }}
                  className="mt-4 text-orange-600 font-black uppercase text-xs tracking-widest hover:underline"
                >
                  Clear Filters
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Featured Section */}
      {featuredProducts.length > 0 && (
        <section className="py-12">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="mb-8">
              <h3 className="text-xs font-black text-orange-600 uppercase tracking-widest mb-2 px-1">Curated</h3>
              <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tight">Handpicked Classics</h2>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredProducts.map(product => (
                <ProductCard 
                  key={product.id} 
                  product={product} 
                  onQuickView={setSelectedProduct} 
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Trust Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 bg-white rounded-[2rem] p-12 border border-slate-200 shadow-sm">
            <div>
              <div className="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center text-orange-600 mb-6">
                <Sparkles size={24} />
              </div>
              <h3 className="font-black text-slate-900 uppercase tracking-tight mb-4">Why Dubai Bazar?</h3>
              <p className="text-sm text-slate-500 leading-relaxed font-medium">
                Located in Jackson Bazar, Kemari. We source unique items that are hard to find in mainstream markets. Every item is inspected for quality.
              </p>
            </div>
            <div>
              <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center text-green-600 mb-6">
                <MessageCircle size={24} />
              </div>
              <h3 className="font-black text-slate-900 uppercase tracking-tight mb-4">Fast WhatsApp Flow</h3>
              <p className="text-sm text-slate-500 leading-relaxed font-medium">
                Browse, add to cart, and send your order to us on WhatsApp. We offer the most personal shopping experience in Karachi.
              </p>
            </div>
            <div>
              <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 mb-6">
                <TrendingUp size={24} />
              </div>
              <h3 className="font-black text-slate-900 uppercase tracking-tight mb-4">Imported Exclusives</h3>
              <p className="text-sm text-slate-500 leading-relaxed font-medium">
                Transform your room with mechanical figurines, high-performance consoles, and premium tech imports straight from Dubai.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Quick View Modal */}
      <ProductQuickView product={selectedProduct} onClose={() => setSelectedProduct(null)} />
    </div>
  );
};
