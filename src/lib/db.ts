import { Product } from '../types';
import { supabase } from './supabase';
import { INITIAL_PRODUCTS } from '../constants';

const INITIAL_CATEGORIES = ['Gaming', 'Décor', 'Collectibles', 'PC Accessories', 'Gadgets'];

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

  // Only include ID if it looks like a valid UUID. 
  // Otherwise, let Supabase generate it (for new products)
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (product.id && uuidRegex.test(product.id)) {
    row.id = product.id;
  }

  return row;
}

export async function getProducts(): Promise<Product[]> {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching products:', error);
    return [];
  }
  
  if (!data || data.length === 0) {
    return [];
  }
  
  return data.map(mapRowToProduct);
}

export async function getCategories(): Promise<string[]> {
  const { data, error } = await supabase
    .from('categories')
    .select('name')
    .order('name');

  if (error) {
    console.error('Error fetching categories:', error);
    return INITIAL_CATEGORIES;
  }
  
  if (!data || data.length === 0) {
    return [];
  }
  
  return data.map((c: any) => c.name);
}

export async function saveCategory(name: string, oldName?: string): Promise<void> {
  const { error } = await supabase
    .from('categories')
    .upsert({ name }, { onConflict: 'name' });
    
  if (error) {
    console.error('Error saving category:', error);
    throw error;
  }

  // If renaming, update all products to use the new category name
  if (oldName && oldName !== name) {
    const { error: updateError } = await supabase
      .from('products')
      .update({ category: name, selected_category: name })
      .eq('category', oldName);
    
    if (updateError) {
      console.error('Error updating products after category rename:', updateError);
    }
    
    // Delete the old category record
    await deleteCategory(oldName);
  }
}

export async function deleteCategory(name: string): Promise<void> {
  const { error } = await supabase
    .from('categories')
    .delete()
    .eq('name', name);
    
  if (error) {
    console.error('Error deleting category:', error);
    throw error;
  }
}

export async function saveProduct(product: Product): Promise<void> {
  const row = mapProductToRow(product);
  
  let result;
  if (row.id) {
    // Check if it's a real UUID before upserting
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (uuidRegex.test(row.id)) {
      result = await supabase.from('products').upsert(row, { onConflict: 'id' });
    } else {
      delete row.id;
      result = await supabase.from('products').insert(row);
    }
  } else {
    result = await supabase.from('products').insert(row);
  }
    
  if (result.error) {
    console.error('Error saving product:', result.error);
    throw result.error;
  }
}

export async function deleteProduct(id: string): Promise<void> {
  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', id);
    
  if (error) {
    console.error('Error deleting product:', error);
    throw error;
  }
}

export async function incrementProductViews(id: string): Promise<void> {
  try {
    // 1. Fetch current views
    const { data: product, error: fetchErr } = await supabase
      .from('products')
      .select('views')
      .eq('id', id)
      .single();
      
    if (fetchErr) {
      console.warn('Could not fetch views for product', id, fetchErr);
      return;
    }
    
    const currentViews = Number(product.views || 0);
    
    // 2. Increment and update
    const { error: updateErr } = await supabase
      .from('products')
      .update({ views: currentViews + 1 })
      .eq('id', id);
      
    if (updateErr) {
      console.warn('Could not increment views for product', id, updateErr);
    }
  } catch (err) {
    // Silently ignore so we don't break the UI if the column doesn't exist yet
    console.warn('View increment failed', err);
  }
}

export async function resetDB(): Promise<void> {
  console.log('Resetting database...');
  
  if (!window.confirm('This will DELETE all current products and categories then restore defaults. Are you sure?')) {
    return;
  }

  try {
    // 1. Clear tables (Order matters if there's an FK, but here it's fine)
    await supabase.from('products').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('categories').delete().neq('name', '___NON_EXISTENT___');

    // 2. Seed categories
    const categoryRows = INITIAL_CATEGORIES.map(name => ({ name }));
    const { error: catError } = await supabase.from('categories').upsert(categoryRows, { onConflict: 'name' });
    if (catError) throw catError;

    // 3. Seed products
    const productRows = INITIAL_PRODUCTS.map(p => {
      const row = mapProductToRow(p);
      delete row.id; 
      return row;
    });

    const { error: prodError } = await supabase.from('products').insert(productRows);
    if (prodError) throw prodError;
    
    alert('Database successfully reset!');
  } catch (err) {
    console.error('Error resetting DB:', err);
    alert('Failed to reset database partially. Check your RLS permissions.');
  }
}

