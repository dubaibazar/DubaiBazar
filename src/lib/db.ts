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
    stockStatus: row.stock_availability === 'available' || row.stock_availability === true || row.stock_availability === 'in-stock' ? 'in-stock' : 'out-of-stock',
    isFeatured: !!row.visible_in_hero,
    isTrending: !!row.sale_badge,
    specifications: row.specifications || {},
    createdAt: new Date(row.created_at).getTime()
  };
}

// Helper to map Product to DB row
function mapProductToRow(product: Product): any {
  return {
    id: product.id,
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
    created_at: new Date(product.createdAt || Date.now()).toISOString()
  };
}

export async function getProducts(): Promise<Product[]> {
  const { data, error } = await supabase.from('products').select('*');
  if (error) {
    console.error('Error fetching products:', error);
    return [];
  }
  
  if (!data || data.length === 0) {
    // Optionally seed initial products to Supabase if it's completely empty
    const rows = INITIAL_PRODUCTS.map(mapProductToRow);
    await supabase.from('products').insert(rows).select();
    return INITIAL_PRODUCTS;
  }
  
  return data.map(mapRowToProduct);
}

export async function getCategories(): Promise<string[]> {
  const { data, error } = await supabase.from('categories').select('*');
  if (error || !data || data.length === 0) {
    // If no categories table exists or fetching fails, fallback to initial categories to seed
    const rows = INITIAL_CATEGORIES.map(name => ({ name }));
    const result = await supabase.from('categories').insert(rows).select();
    if (result.error) {
      console.warn('Could not seed categories table, it might not exist yet:', result.error);
      return INITIAL_CATEGORIES;
    }
    return INITIAL_CATEGORIES;
  }
  
  return data.map((c: any) => c.name);
}

export async function saveCategory(name: string): Promise<void> {
  const { error } = await supabase.from('categories').upsert({ name }, { onConflict: 'name' });
  if (error) console.error('Error saving category:', error);
}

export async function deleteCategory(name: string): Promise<void> {
  const { error } = await supabase.from('categories').delete().eq('name', name);
  if (error) console.error('Error deleting category:', error);
}

export async function saveProduct(product: Product): Promise<void> {
  const row = mapProductToRow(product);
  const { error } = await supabase.from('products').upsert(row, { onConflict: 'id' });
  if (error) console.error('Error saving product:', error);
}

export async function deleteProduct(id: string): Promise<void> {
  const { error } = await supabase.from('products').delete().eq('id', id);
  if (error) console.error('Error deleting product:', error);
}

export async function resetDB(): Promise<void> {
  // Not recommended to clear real db, but if needed:
  // For safety, let's not actually wipe Supabase from frontend
  console.warn('resetDB called, deleting all products not recommended in production Supabase');
}

