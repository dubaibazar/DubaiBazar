import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getProducts, saveProduct, deleteProduct, resetDB, getCategories, saveCategory, deleteCategory } from '../lib/db';
import { Product } from '../types';
import { 
  BarChart3, Plus, Edit, Trash2, LayoutDashboard, Settings as SettingsIcon, 
  LogOut, Package, Eye, Activity, Search, Save, X, PlusCircle, Image as ImageIcon,
  Tag
} from 'lucide-react';
import { formatPKR, cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

import { Logo } from '../components/layout/Logo';

export const AdminDashboard: React.FC = () => {
  const { isAdmin, logout, isLoading } = useAuth();
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<'products' | 'categories' | 'seo'>('products');
  const [newCategoryName, setNewCategoryName] = useState('');
  const [seoData, setSeoData] = useState({
    title: localStorage.getItem('dubai-bazar-seo-title') || 'Dubai Bazar | Karachi Elite Tech',
    description: localStorage.getItem('dubai-bazar-seo-description') || 'Gadgets, collectibles, and gaming gear in Karachi.'
  });

  const saveSEO = () => {
    localStorage.setItem('dubai-bazar-seo-title', seoData.title);
    localStorage.setItem('dubai-bazar-seo-description', seoData.description);
    // Also save in the common object for SEOEffect
    localStorage.setItem('dubai-bazar-seo', JSON.stringify(seoData));
    alert('SEO Settings Saved!');
  };
  
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [views, setViews] = useState<Record<string, number>>({});
  
  const [formData, setFormData] = useState<Partial<Product>>({
    name: '',
    description: '',
    price: 0,
    category: '',
    images: [],
    stockStatus: 'in-stock',
    specifications: {},
  });

  useEffect(() => {
    if (!isLoading) {
      if (!isAdmin) {
        navigate('/login');
      } else {
        fetchData();
      }
    }
  }, [isAdmin, isLoading, navigate]);

  const fetchData = async () => {
    const [pData, cData] = await Promise.all([getProducts(), getCategories()]);
    setProducts(pData);
    setCategories(cData);
    const savedViews = JSON.parse(localStorage.getItem('viewer-activity') || '{}');
    setViews(savedViews);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (isLoading || (!isAdmin && !isLoading)) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-50 animate-pulse"><Logo size="lg" showText={false} /></div>;
  }

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    const name = newCategoryName.trim();
    if (!name) return;
    
    if (editingCategory) {
      if (name !== editingCategory && categories.includes(name)) {
        alert('Category already exists');
        return;
      }
      // Note: In a production app, we would use a batch update to update all products with this category
      // For this demo, we'll just update the categories list
      await saveCategory(name);
      if (name !== editingCategory) {
        await deleteCategory(editingCategory);
      }
    } else {
      if (categories.includes(name)) {
        alert('Category already exists');
        return;
      }
      await saveCategory(name);
    }
    
    setNewCategoryName('');
    setIsAddingCategory(false);
    setEditingCategory(null);
    fetchData();
  };

  const handleDeleteCategory = async (name: string) => {
    if (products.some(p => p.category === name)) {
      alert('Cannot delete category that is in use by products');
      return;
    }
    if (window.confirm(`Delete category "${name}"?`)) {
      await deleteCategory(name);
      fetchData();
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      await deleteProduct(id);
      fetchData();
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const productData = {
      ...formData,
      id: formData.id || Date.now().toString(),
      createdAt: formData.createdAt || Date.now(),
      images: formData.images?.length ? formData.images : ['https://placehold.co/600x600?text=Dubai+Bazar'],
    } as Product;
    
    await saveProduct(productData);
    setIsAddingProduct(false);
    setEditingProduct(null);
    setFormData({
      name: '',
      description: '',
      price: 0,
      category: '',
      images: [],
      stockStatus: 'in-stock',
      specifications: {},
    });
    fetchData();
  };

  const handleEdit = (product: Product) => {
    setFormData(product);
    setEditingProduct(product);
    setIsAddingProduct(true);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({
          ...prev,
          images: [...(prev.images || []), reader.result as string]
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalViews = (Object.values(views) as number[]).reduce((a, b) => a + b, 0);
  const topProduct = products.reduce((prev, current) => {
    return (views[prev?.id || ''] || 0) > (views[current.id] || 0) ? prev : current;
  }, products[0]);

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar - Hidden on mobile, sticky on desktop */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col hidden lg:flex border-r border-slate-800 shrink-0 h-screen sticky top-0">
        <div className="p-8 border-b border-white/5">
          <Logo size="sm" showText={false} />
          <h2 className="text-sm font-black uppercase tracking-widest text-white mt-4">Ops Center</h2>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <button 
            onClick={() => setActiveTab('products')}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-[11px] uppercase tracking-widest transition-all",
              activeTab === 'products' ? "bg-orange-600 text-white shadow-lg shadow-orange-900" : "text-white/40 hover:text-white hover:bg-white/5"
            )}
          >
            <Package size={16} /> Products
          </button>
          <button 
            onClick={() => setActiveTab('categories')}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-[11px] uppercase tracking-widest transition-all",
              activeTab === 'categories' ? "bg-orange-600 text-white shadow-lg shadow-orange-900" : "text-white/40 hover:text-white hover:bg-white/5"
            )}
          >
            <Tag size={16} /> Categories
          </button>
          <button 
            onClick={() => setActiveTab('seo')}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-[11px] uppercase tracking-widest transition-all",
              activeTab === 'seo' ? "bg-orange-600 text-white shadow-lg shadow-orange-900" : "text-white/40 hover:text-white hover:bg-white/5"
            )}
          >
            <SettingsIcon size={16} /> SEO Settings
          </button>
        </nav>
        <div className="p-4 border-t border-white/5 space-y-1">
          <button 
            onClick={async () => {
              if (window.confirm('This will delete all your changes and reset to initial products. Continue?')) {
                await resetDB();
                fetchData();
              }
            }}
            className="w-full flex items-center gap-3 px-4 py-3 text-orange-400 hover:bg-orange-500/10 rounded-xl transition-colors font-black text-[10px] uppercase tracking-widest"
          >
            <Activity size={16} /> Reset DB
          </button>
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-red-500/10 rounded-xl transition-colors font-black text-[10px] uppercase tracking-widest"
          >
            <LogOut size={16} /> Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        {/* Header */}
        <header className="bg-white border-b border-slate-200 px-4 md:px-8 py-4 flex flex-col gap-4 sticky top-0 z-20 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="text-xl font-black text-slate-900 uppercase tracking-tight">
                {activeTab === 'products' ? 'Inventory' : activeTab === 'categories' ? 'Categories' : 'Settings'}
              </h1>
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => {
                  setNewCategoryName('');
                  setEditingCategory(null);
                  setIsAddingCategory(true);
                }}
                className="flex items-center gap-2 p-3 md:px-5 md:py-3 bg-slate-100 text-slate-900 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-slate-200 transition-all active:scale-95"
                title="Add Category"
              >
                <PlusCircle size={18} /> <span className="hidden md:inline">Category</span>
              </button>
              <button 
                onClick={() => {
                  setFormData({
                    name: '',
                    description: '',
                    price: 0,
                    category: '',
                    images: [],
                    stockStatus: 'in-stock',
                    specifications: {},
                  });
                  setIsAddingProduct(true);
                }}
                className="flex items-center gap-2 p-3 md:px-6 md:py-3 bg-orange-600 text-white rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-orange-700 transition-all shadow-lg shadow-orange-100 active:scale-95"
                title="Add Product"
              >
                <Plus size={18} /> <span className="hidden md:inline">Product</span>
              </button>
            </div>
          </div>

          {/* Mobile Tabs Navigation */}
          <div className="lg:hidden flex items-center gap-1 overflow-x-auto pb-1 scrollbar-hide border-t border-slate-50 pt-3">
            {[
              { id: 'products', name: 'Products', icon: Package },
              { id: 'categories', name: 'Categories', icon: Tag },
              { id: 'seo', name: 'SEO', icon: SettingsIcon },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-lg font-black text-[9px] uppercase tracking-widest transition-all whitespace-nowrap",
                  activeTab === tab.id ? "bg-orange-600 text-white shadow-md shadow-orange-100" : "text-slate-400 bg-slate-50 hover:bg-slate-100"
                )}
              >
                <tab.icon size={14} />
                {tab.name}
              </button>
            ))}
            <button 
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 rounded-lg font-black text-[9px] uppercase tracking-widest text-red-500 bg-red-50 ml-auto"
            >
              <LogOut size={14} />
            </button>
          </div>
        </header>

        <div className="p-4 md:p-8 space-y-8">
          {activeTab === 'products' ? (
            <>
              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-[1.5rem] border border-slate-200 shadow-sm">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="p-3 bg-orange-50 rounded-xl text-orange-600">
                      <Activity size={24} />
                    </div>
                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Views</h3>
                  </div>
                  <p className="text-3xl font-black text-slate-900 tracking-tight">{totalViews}</p>
                </div>
                <div className="bg-white p-6 rounded-[1.5rem] border border-slate-200 shadow-sm">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="p-3 bg-green-50 rounded-xl text-green-600">
                      <Package size={24} />
                    </div>
                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">In Stock</h3>
                  </div>
                  <p className="text-3xl font-black text-slate-900 tracking-tight">
                    {products.filter(p => p.stockStatus === 'in-stock').length}
                  </p>
                </div>
                <div className="bg-white p-6 rounded-[1.5rem] border border-slate-200 shadow-sm">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="p-3 bg-indigo-50 rounded-xl text-indigo-600">
                      <Tag size={24} />
                    </div>
                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Categories</h3>
                  </div>
                  <p className="text-3xl font-black text-slate-900 tracking-tight">
                    {categories.length}
                  </p>
                </div>
                <div className="bg-white p-6 rounded-[1.5rem] border border-slate-200 shadow-sm">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="p-3 bg-indigo-50 rounded-xl text-indigo-600">
                      <Eye size={24} />
                    </div>
                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Top Selling Item</h3>
                  </div>
                  <p className="text-xl font-black text-slate-900 uppercase truncate">
                    {topProduct?.name || 'N/A'}
                  </p>
                </div>
              </div>

              {/* Product Management */}
              <div className="bg-white rounded-[1.5rem] border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-100 flex items-center justify-between flex-wrap gap-4">
                  <h2 className="font-black text-slate-900 uppercase tracking-tight">Product Catalog</h2>
                  <div className="relative w-full md:w-64">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input 
                      type="text" 
                      placeholder="Filter inventory..." 
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border-none rounded-xl text-xs focus:ring-2 focus:ring-orange-500 transition-all font-bold outline-none"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                </div>
                
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-slate-50/50 text-[10px] text-slate-400 uppercase tracking-widest font-black border-b border-slate-100">
                      <tr>
                        <th className="px-6 py-4">Product Details</th>
                        <th className="px-6 py-4">Category</th>
                        <th className="px-6 py-4">Price</th>
                        <th className="px-6 py-4">Inventory</th>
                        <th className="px-6 py-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredProducts.map(product => (
                        <tr key={product.id} className="hover:bg-slate-50/50 transition-colors group">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-4">
                              <div className="h-12 w-12 rounded-xl overflow-hidden bg-slate-50 border border-slate-100 shadow-sm">
                                <img src={product.images[0]} alt="" className="h-full w-full object-cover" />
                              </div>
                              <div className="flex flex-col">
                                <span className="text-xs font-black text-slate-900 uppercase tracking-tight leading-none mb-1.5">{product.name}</span>
                                <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">ID: {product.id}</span>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-[9px] font-black text-orange-600 bg-orange-50 px-2 py-1 rounded uppercase tracking-widest">{product.category}</span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-xs font-black text-slate-900">{formatPKR(product.price)}</span>
                          </td>
                          <td className="px-6 py-4">
                            {product.stockStatus === 'in-stock' ? (
                              <span className="text-[9px] font-black text-green-600 bg-green-50 px-2 py-1 rounded uppercase tracking-widest">In Stock</span>
                            ) : (
                              <span className="text-[9px] font-black text-red-600 bg-red-50 px-2 py-1 rounded uppercase tracking-widest">Sold Out</span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <button 
                                onClick={() => handleEdit(product)}
                                className="p-2.5 text-slate-400 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-all"
                              >
                                <Edit size={16} />
                              </button>
                              <button 
                                onClick={() => handleDelete(product.id)}
                                className="p-2.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Card List */}
                <div className="md:hidden grid grid-cols-1 gap-4 p-4">
                  {filteredProducts.map(product => (
                    <div key={product.id} className="bg-slate-50 border border-slate-100 rounded-2xl p-4 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="h-16 w-16 rounded-xl overflow-hidden border border-white shadow-sm bg-white shrink-0">
                          <img src={product.images[0]} alt="" className="h-full w-full object-cover" />
                        </div>
                        <div>
                          <h4 className="text-[11px] font-black text-slate-900 uppercase tracking-tight mb-1">{product.name}</h4>
                          <div className="flex items-center gap-2">
                             <span className="text-[9px] font-black text-orange-600 px-1.5 py-0.5 bg-orange-50 rounded italic">{product.category}</span>
                             <span className="text-[10px] font-black text-slate-700">{formatPKR(product.price)}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col gap-2">
                        <button 
                          onClick={() => handleEdit(product)}
                          className="p-2 bg-white text-slate-400 hover:text-orange-600 rounded-lg shadow-sm"
                        >
                          <Edit size={16} />
                        </button>
                        <button 
                          onClick={() => handleDelete(product.id)}
                          className="p-2 bg-white text-slate-400 hover:text-red-500 rounded-lg shadow-sm"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : activeTab === 'categories' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {categories.map((cat) => (
                <div key={cat} className="group relative bg-white border border-slate-200 rounded-[1.5rem] p-6 hover:border-orange-500 hover:shadow-xl hover:shadow-orange-500/5 transition-all">
                  <div className="flex flex-col gap-4">
                    <div className="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center text-orange-600 mb-2">
                      <Tag size={20} />
                    </div>
                    <div>
                      <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">{cat}</h3>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">
                        {products.filter(p => p.category === cat).length} Products
                      </p>
                    </div>
                    
                    <div className="flex items-center gap-2 pt-4 border-t border-slate-50">
                      <button 
                         onClick={() => {
                           setNewCategoryName(cat);
                           setEditingCategory(cat);
                           setIsAddingCategory(true);
                         }}
                         className="flex-1 flex items-center justify-center gap-2 py-2 bg-slate-50 hover:bg-orange-50 text-slate-400 hover:text-orange-600 rounded-lg transition-all font-bold text-[10px] uppercase tracking-widest"
                      >
                        <Edit size={14} /> Edit
                      </button>
                      <button 
                        onClick={() => handleDeleteCategory(cat)}
                        className="flex-1 flex items-center justify-center gap-2 py-2 bg-slate-50 hover:bg-red-50 text-slate-400 hover:text-red-500 rounded-lg transition-all font-bold text-[10px] uppercase tracking-widest"
                      >
                        <Trash2 size={14} /> Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              <button 
                onClick={() => {
                  setNewCategoryName('');
                  setEditingCategory(null);
                  setIsAddingCategory(true);
                }}
                className="flex flex-col items-center justify-center gap-4 p-8 bg-slate-50 border-2 border-dashed border-slate-200 rounded-[1.5rem] text-slate-400 hover:text-orange-600 hover:border-orange-300 transition-all group"
              >
                <PlusCircle size={32} className="group-hover:scale-110 transition-transform" />
                <span className="font-black uppercase tracking-widest text-[10px]">New Category</span>
              </button>
            </div>
          ) : (
            <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm p-10 max-w-2xl">
              <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight mb-8">Metadata Settings</h2>
              <div className="space-y-6">
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Store Title (SEO)</label>
                  <input 
                    type="text" 
                    className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:ring-2 focus:ring-orange-500 outline-none transition-all font-bold text-slate-900"
                    value={seoData.title}
                    onChange={(e) => setSeoData({...seoData, title: e.target.value})}
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Store Description (Meta)</label>
                  <textarea 
                    rows={4}
                    className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:ring-2 focus:ring-orange-500 outline-none transition-all font-bold text-slate-900 resize-none"
                    value={seoData.description}
                    onChange={(e) => setSeoData({...seoData, description: e.target.value})}
                  />
                </div>
                <button 
                  onClick={saveSEO}
                  className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-black transition-all flex items-center justify-center gap-3 active:scale-95 shadow-xl shadow-slate-200"
                >
                  <Save size={18} />
                  Update Store SEO
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Edit/Add Modal */}
      <AnimatePresence>
        {isAddingCategory && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
              onClick={() => setIsAddingCategory(false)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl p-10 border border-slate-200"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h3 className="text-[10px] font-black text-orange-600 uppercase tracking-widest mb-2">Category Hub</h3>
                  <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">
                    {editingCategory ? 'Edit Category' : 'New Category'}
                  </h2>
                </div>
                <button onClick={() => setIsAddingCategory(false)} className="p-3 bg-slate-50 hover:bg-slate-100 rounded-full text-slate-400">
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleAddCategory} className="space-y-6">
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Category Legal Name</label>
                  <input 
                    required
                    autoFocus
                    type="text" 
                    placeholder="e.g. Gaming Gear"
                    className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:ring-2 focus:ring-orange-500 outline-none transition-all font-bold text-slate-900"
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                  />
                </div>
                
                <div className="pt-6">
                  <button 
                    type="submit"
                    className="w-full bg-slate-900 text-white font-black py-4 rounded-2xl flex items-center justify-center gap-3 hover:bg-black transition-all shadow-xl shadow-slate-200 active:scale-95 uppercase tracking-widest text-xs"
                  >
                    <Save size={20} />
                    {editingCategory ? 'Update Category' : 'Create Category'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}

        {isAddingProduct && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
              onClick={() => setIsAddingProduct(false)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-white w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-[2.5rem] shadow-2xl p-10 border border-slate-200"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-10">
                <div>
                  <h3 className="text-[10px] font-black text-orange-600 uppercase tracking-widest mb-2">Item Management</h3>
                  <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tight">
                    {editingProduct ? 'Update Product' : 'Create Entry'}
                  </h2>
                </div>
                <button onClick={() => setIsAddingProduct(false)} className="p-3 bg-slate-50 hover:bg-slate-100 rounded-full text-slate-400">
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleSave} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Product Name</label>
                    <input 
                      required
                      type="text" 
                      className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:ring-2 focus:ring-orange-500 outline-none transition-all font-bold text-slate-900"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Category</label>
                    <select 
                      required
                      className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:ring-2 focus:ring-orange-500 outline-none transition-all font-bold text-slate-900 appearance-none"
                      value={formData.category}
                      onChange={(e) => setFormData({...formData, category: e.target.value})}
                    >
                      <option value="">Select Category</option>
                      {categories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Price (PKR)</label>
                    <input 
                      required
                      type="number" 
                      className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:ring-2 focus:ring-orange-500 outline-none transition-all font-bold text-slate-900"
                      value={formData.price}
                      onChange={(e) => setFormData({...formData, price: Number(e.target.value)})}
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Stock Availability</label>
                    <select 
                      className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:ring-2 focus:ring-orange-500 outline-none transition-all font-bold text-slate-900 appearance-none"
                      value={formData.stockStatus}
                      onChange={(e) => setFormData({...formData, stockStatus: e.target.value as any})}
                    >
                      <option value="in-stock">Available in Store</option>
                      <option value="out-of-stock">Mark as Sold Out</option>
                    </select>
                  </div>
                </div>

                <div className="flex gap-8 pl-1">
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <input 
                      type="checkbox" 
                      className="w-5 h-5 rounded-lg border-slate-300 text-orange-600 focus:ring-orange-500"
                      checked={formData.isFeatured}
                      onChange={(e) => setFormData({...formData, isFeatured: e.target.checked})}
                    />
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest group-hover:text-orange-600 transition-colors">Visible in Hero</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <input 
                      type="checkbox" 
                      className="w-5 h-5 rounded-lg border-slate-300 text-red-600 focus:ring-red-500"
                      checked={formData.isTrending}
                      onChange={(e) => setFormData({...formData, isTrending: e.target.checked})}
                    />
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest group-hover:text-red-500 transition-colors">Sale Badge</span>
                  </label>
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Product Description</label>
                  <textarea 
                    required
                    rows={3}
                    className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:ring-2 focus:ring-orange-500 outline-none transition-all font-bold text-slate-900 resize-none"
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                  />
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Specifications</label>
                    <button 
                      type="button"
                      onClick={() => {
                        const key = prompt('Specification name (e.g. Color, Size)');
                        if (key) setFormData({...formData, specifications: {...formData.specifications, [key]: ''}});
                      }}
                      className="text-[10px] font-black text-orange-600 uppercase hover:underline"
                    >
                      + Add Row
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.entries(formData.specifications || {}).map(([key, value]) => (
                      <div key={key} className="flex gap-2">
                        <div className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 flex flex-col">
                          <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mb-1">{key}</span>
                          <input 
                            type="text" 
                            className="bg-transparent text-sm font-black text-slate-800 focus:outline-none"
                            value={value}
                            onChange={(e) => setFormData({
                              ...formData, 
                              specifications: {...formData.specifications, [key]: e.target.value}
                            })}
                          />
                        </div>
                        <button 
                          type="button"
                          onClick={() => {
                            const newSpecs = {...formData.specifications};
                            delete newSpecs[key];
                            setFormData({...formData, specifications: newSpecs});
                          }}
                          className="p-2 text-slate-300 hover:text-red-500 transition-colors"
                        >
                          <X size={18} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 block pb-3 border-b border-slate-100">Gallery Assets</label>
                  <div className="flex flex-wrap gap-4">
                    {formData.images?.map((img, idx) => (
                      <div key={idx} className="relative h-24 w-24 rounded-2xl overflow-hidden group border border-slate-200">
                        <img src={img} className="h-full w-full object-cover" />
                        <button 
                          type="button"
                          onClick={() => setFormData({...formData, images: formData.images?.filter((_, i) => i !== idx)})}
                          className="absolute inset-0 bg-red-600/90 text-white opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center font-black uppercase text-[10px] tracking-widest"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                    <label className="h-24 w-24 rounded-2xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400 hover:text-orange-600 hover:border-orange-300 transition-all cursor-pointer bg-slate-50/50">
                      <ImageIcon size={24} />
                      <span className="text-[9px] font-black uppercase mt-1.5 tracking-widest">Upload</span>
                      <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                    </label>
                  </div>
                </div>

                <div className="pt-6">
                  <button 
                    type="submit"
                    className="w-full bg-slate-900 text-white font-black py-4 rounded-2xl flex items-center justify-center gap-3 hover:bg-black transition-all shadow-xl shadow-slate-200 active:scale-95 uppercase tracking-widest text-xs"
                  >
                    <Save size={20} />
                    {editingProduct ? 'Commit Changes' : 'Initialize Product'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
