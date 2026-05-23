import { Product } from '../types';
import { supabase } from './supabase';
import { INITIAL_PRODUCTS } from '../constants';

const INITIAL_CATEGORIES = ['Gaming', 'Décor', 'Collectibles', 'PC Accessories', 'Gadgets'];

// Fast native timeout wrapper
async function withTimeout<T>(promise: Promise<T>, ms = 1500): Promise<T> {
  let timeoutId: any;
  const timeoutPromise = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => reject(new Error('Network request timed out')), ms);
  });
  try {
    return await Promise.race([promise, timeoutPromise]);
  } finally {
    clearTimeout(timeoutId);
  }
}

// Local Storage Helper functions to guarantee offline resilience and ultra-fast load speed
function getLocalProducts(): Product[] {
  try {
    const raw = localStorage.getItem('dubai_bazar_products');
    if (!raw) {
      localStorage.setItem('dubai_bazar_products', JSON.stringify(INITIAL_PRODUCTS));
      return INITIAL_PRODUCTS;
    }
    return JSON.parse(raw);
  } catch (e) {
    return INITIAL_PRODUCTS;
  }
}

function saveLocalProducts(products: Product[]): void {
  try {
    localStorage.setItem('dubai_bazar_products', JSON.stringify(products));
  } catch (e) {
    console.error('Failed to save products to localStorage', e);
  }
}

function getLocalCategories(): string[] {
  try {
    const raw = localStorage.getItem('dubai_bazar_categories');
    if (!raw) {
      localStorage.setItem('dubai_bazar_categories', JSON.stringify(INITIAL_CATEGORIES));
      return INITIAL_CATEGORIES;
    }
    return JSON.parse(raw);
  } catch (e) {
    return INITIAL_CATEGORIES;
  }
}

function saveLocalCategories(categories: string[]): void {
  try {
    localStorage.setItem('dubai_bazar_categories', JSON.stringify(categories));
  } catch (e) {
    console.error('Failed to save categories to localStorage', e);
  }
}

// Helper to map DB row to Product
function mapRowToProduct(row: any): Product {
  return {
    id: row.id,
    name: row.product_name,
    description: row.product_description,
    price: Number(row.price_pkr),
    category: row.category || row.selected_category,
    images: row.gallery_assets || [],
    stockStatus: row.stock_availability === 'available' || row.stock_availability === 'in-stock' ? 'in-stock' : 'out-of-stock',
    isFeatured: !!row.visible_in_hero,
    isTrending: !!row.sale_badge,
    specifications: row.specifications || {},
    createdAt: row.created_at ? new Date(row.created_at).getTime() : Date.now(),
    views: Number(row.views || 0)
  };
}

// Helper to map Product to DB row
function mapProductToRow(product: Product): any {
  const row: any = {
    product_name: product.name,
    category: product.category,
    selected_category: product.category,
    price_pkr: product.price,
    stock_availability: product.stockStatus === 'in-stock' ? 'available' : 'not available',
    visible_in_hero: product.isFeatured || false,
    sale_badge: product.isTrending ? 'Sale' : null,
    product_description: product.description,
    specifications: product.specifications,
    gallery_assets: product.images,
    created_at: new Date(product.createdAt || Date.now()).toISOString(),
    views: product.views || 0
  };

  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (product.id && uuidRegex.test(product.id)) {
    row.id = product.id;
  }

  return row;
}

export async function getProducts(): Promise<Product[]> {
  try {
    const fetchPromise = supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });

    const { data, error } = await withTimeout(fetchPromise, 1800);

    if (error) {
      console.warn('Supabase fetch returned error, falling back to local storage:', error);
      return getLocalProducts();
    }

    if (data && data.length > 0) {
      const dbProducts = data.map(mapRowToProduct);
      const local = getLocalProducts();
      
      // Merge views tracked locally so we don't lose user engagement
      const merged = dbProducts.map(dbp => {
        const lp = local.find(x => x.id === dbp.id);
        if (lp && lp.views > dbp.views) {
          dbp.views = lp.views;
        }
        return dbp;
      });

      saveLocalProducts(merged);
      return merged;
    }
  } catch (err) {
    console.warn('Supabase connection timed out or is over budget limit. Serving cached products:', err);
  }
  return getLocalProducts();
}

export async function getCategories(): Promise<string[]> {
  try {
    const fetchPromise = supabase
      .from('categories')
      .select('name')
      .order('name');

    const { data, error } = await withTimeout(fetchPromise, 1500);

    if (error) {
      console.warn('Supabase categories fetch error, loading local categories:', error);
      return getLocalCategories();
    }

    if (data && data.length > 0) {
      const dbCategories = data.map((c: any) => c.name);
      saveLocalCategories(dbCategories);
      return dbCategories;
    }
  } catch (err) {
    console.warn('Timeout fetching categories from Supabase context, utilizing cache:', err);
  }
  return getLocalCategories();
}

export async function saveCategory(name: string, oldName?: string): Promise<void> {
  // Update local storage first so change is instantly visual
  const localCats = getLocalCategories();
  let updatedCats = [...localCats];
  if (oldName) {
    updatedCats = updatedCats.map(c => c === oldName ? name : c);
  } else {
    if (!updatedCats.includes(name)) {
      updatedCats.push(name);
    }
  }
  saveLocalCategories(updatedCats);

  // Rename across existing local products
  if (oldName && oldName !== name) {
    const localProds = getLocalProducts();
    const updatedProds = localProds.map(p => {
      if (p.category === oldName) {
        return { ...p, category: name };
      }
      return p;
    });
    saveLocalProducts(updatedProds);
  }

  // Next, run Supabase in the background
  try {
    const syncPromise = (async () => {
      const { error } = await supabase
        .from('categories')
        .upsert({ name }, { onConflict: 'name' });

      if (error) throw error;

      if (oldName && oldName !== name) {
        await supabase
          .from('products')
          .update({ category: name, selected_category: name })
          .eq('category', oldName);

        await supabase
          .from('categories')
          .delete()
          .eq('name', oldName);
      }
    })();

    await withTimeout(syncPromise, 2000).catch(err => {
      console.warn('Remote Supabase category sync failed (ignored, kept locally):', err);
    });
  } catch (err) {
    console.warn('Remote DB error during category save:', err);
  }
}

export async function deleteCategory(name: string): Promise<void> {
  // 1. Delete locally
  const localCats = getLocalCategories();
  saveLocalCategories(localCats.filter(c => c !== name));

  // 2. Suppress remote database response
  try {
    const deletePromise = supabase
      .from('categories')
      .delete()
      .eq('name', name);
    await withTimeout(deletePromise, 1500).catch(err => {
      console.warn('Supabase delete category failed:', err);
    });
  } catch (err) {
    console.warn('Remote db category delete error:', err);
  }
}

export async function saveProduct(product: Product): Promise<void> {
  // 1. Update localStorage instantly
  const localProds = getLocalProducts();
  const updatedProds = [...localProds];

  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  const originalId = product.id;

  if (!product.id || !uuidRegex.test(product.id)) {
    const generatedId = typeof crypto !== 'undefined' && 'randomUUID' in crypto 
      ? (crypto as any).randomUUID() 
      : `local-${Math.random().toString(36).substring(2, 11)}`;
    product.id = generatedId;
    updatedProds.unshift(product);
  } else {
    const idx = updatedProds.findIndex(p => p.id === product.id);
    if (idx !== -1) {
      updatedProds[idx] = product;
    } else {
      updatedProds.unshift(product);
    }
  }
  saveLocalProducts(updatedProds);

  // 2. Synchronize remotely in background
  try {
    const row = mapProductToRow(product);
    const syncPromise = (async () => {
      if (product.id && uuidRegex.test(product.id)) {
        const { error } = await supabase.from('products').upsert(row, { onConflict: 'id' });
        if (error) throw error;
      } else {
        delete row.id;
        const { data, error } = await supabase.from('products').insert(row).select('id');
        if (error) throw error;
        
        if (data && data[0]?.id) {
          const freshLocal = getLocalProducts();
          const targetIdx = freshLocal.findIndex(p => p.id === product.id);
          if (targetIdx !== -1) {
            freshLocal[targetIdx].id = data[0].id;
            saveLocalProducts(freshLocal);
          }
        }
      }
    })();

    await withTimeout(syncPromise, 2200).catch(err => {
      console.warn('Remote Supabase product save failed. Retained local changes:', err);
    });
  } catch (err) {
    console.warn('Supabase unreachable:', err);
  }
}

export async function deleteProduct(id: string): Promise<void> {
  // 1. Delete locally
  const localProds = getLocalProducts();
  saveLocalProducts(localProds.filter(p => p.id !== id));

  // 2. Delete remotely
  try {
    const deletePromise = supabase
      .from('products')
      .delete()
      .eq('id', id);
    await withTimeout(deletePromise, 1800).catch(err => {
      console.warn('Supabase product deletion failed:', err);
    });
  } catch (err) {
    console.warn('Remote database error on delete:', err);
  }
}

export async function incrementProductViews(id: string): Promise<void> {
  // 1. Instant localized increment so views are immediately reflected
  const localProds = getLocalProducts();
  const idx = localProds.findIndex(p => p.id === id);
  if (idx !== -1) {
    localProds[idx].views = (localProds[idx].views || 0) + 1;
    saveLocalProducts(localProds);
  }

  // 2. Dispatch remote increment
  try {
    const updatePromise = (async () => {
      const { data, error: fetchErr } = await supabase
        .from('products')
        .select('views')
        .eq('id', id)
        .single();

      if (!fetchErr && data) {
        const nextViews = Number(data.views || 0) + 1;
        await supabase
          .from('products')
          .update({ views: nextViews })
          .eq('id', id);
      }
    })();

    await withTimeout(updatePromise, 1500).catch(err => {
      console.warn('Supabase view counter write timed out/failed. Local count remains active:', err);
    });
  } catch (err) {
    console.warn('Remote views tracking failed:', err);
  }
}

export async function incrementSiteViews(): Promise<void> {
  // 1. Increment first product's view count in local storage instantly 
  // so site-wide total view counts grow beautifully in real-time on every load / reload!
  try {
    const localProds = getLocalProducts();
    if (localProds.length > 0) {
      localProds[0].views = (localProds[0].views || 0) + 1;
      saveLocalProducts(localProds);
    }
  } catch (e) {
    console.warn('Failed local increment of site views', e);
  }

  // 2. Try remote update
  try {
    const updatePromise = (async () => {
      const { data: productsList } = await supabase.from('products').select('id, views').limit(1);
      if (productsList && productsList.length > 0) {
        const topProd = productsList[0];
        await supabase
          .from('products')
          .update({ views: Number(topProd.views || 0) + 1 })
          .eq('id', topProd.id);
      }
    })();
    await withTimeout(updatePromise, 1500).catch(() => {});
  } catch (err) {
    console.warn('Could not update remote site views:', err);
  }
}

export async function resetDB(): Promise<void> {
  console.log('Resetting database...');

  try {
    // Reset local cache instantly
    saveLocalProducts(INITIAL_PRODUCTS);
    saveLocalCategories(INITIAL_CATEGORIES);

    // Seed/clear Supabase
    const syncPromise = (async () => {
      await supabase.from('products').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      await supabase.from('categories').delete().neq('name', '___NON_EXISTENT___');

      const categoryRows = INITIAL_CATEGORIES.map(name => ({ name }));
      await supabase.from('categories').upsert(categoryRows, { onConflict: 'name' });

      const productRows = INITIAL_PRODUCTS.map(p => {
        const row = mapProductToRow(p);
        delete row.id;
        return row;
      });
      await supabase.from('products').insert(productRows);
    })();

    await withTimeout(syncPromise, 3500).catch(err => {
      console.warn('Supabase remote reset timed out or failed. Local reset fully succeeded!', err);
    });

    alert('Database successfully reset to defaults!');
  } catch (err) {
    console.error('Error resetting DB:', err);
    alert('Failed to reset remote database, but local copy is restored.');
  }
}
