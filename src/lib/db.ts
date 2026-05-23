import { Product } from '../types';
import { INITIAL_PRODUCTS } from '../constants';
import { db, auth } from './firebase';
import { 
  collection, 
  getDocs, 
  doc, 
  setDoc, 
  deleteDoc, 
  updateDoc, 
  getDoc, 
  query, 
  orderBy,
  onSnapshot
} from 'firebase/firestore';

const INITIAL_CATEGORIES = ['Gaming', 'Décor', 'Collectibles', 'PC Accessories', 'Gadgets'];

// Error reporting for Firestore failures in compliance with AI Studio Diagnostic format
enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Fast native timeout wrapper
async function withTimeout<T>(promise: Promise<T>, ms = 2200): Promise<T> {
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

// Cache local synchronization helpers
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

export async function getProducts(): Promise<Product[]> {
  const path = 'products';
  try {
    const fetchPromise = (async () => {
      const q = query(collection(db, path), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      const items: Product[] = [];
      snapshot.forEach(doc => {
        const d = doc.data();
        items.push({
          id: doc.id,
          name: d.name || '',
          description: d.description || '',
          price: Number(d.price || 0),
          category: d.category || '',
          images: d.images || [],
          stockStatus: d.stockStatus || 'in-stock',
          isFeatured: !!d.isFeatured,
          isTrending: !!d.isTrending,
          specifications: d.specifications || {},
          createdAt: Number(d.createdAt || Date.now()),
          views: Number(d.views || 0)
        });
      });
      return items;
    })();

    let dbProducts = await withTimeout(fetchPromise, 3000);

    // Auto-seed default products if Firestore is completely empty (fresh database)
    if (dbProducts.length === 0) {
      console.log('Firebase store is empty, auto-seeding default products...');
      const seedPromises = INITIAL_PRODUCTS.map(p => {
        return setDoc(doc(db, 'products', p.id), {
          name: p.name,
          description: p.description,
          price: Number(p.price),
          category: p.category,
          images: p.images,
          stockStatus: p.stockStatus,
          isFeatured: !!p.isFeatured,
          isTrending: !!p.isTrending,
          specifications: p.specifications || {},
          createdAt: Number(p.createdAt || Date.now()),
          views: 0
        });
      });
      await Promise.all(seedPromises);
      dbProducts = [...INITIAL_PRODUCTS];
    }

    const local = getLocalProducts();
    const merged = dbProducts.map(dbp => {
      const lp = local.find(x => x.id === dbp.id);
      if (lp && lp.views > dbp.views) {
        dbp.views = lp.views;
      }
      return dbp;
    });
    saveLocalProducts(merged);
    return merged;
  } catch (err) {
    console.warn('Firestore products fetch issue. Serving cached:', err);
  }
  return getLocalProducts();
}

export async function getCategories(): Promise<string[]> {
  const path = 'categories';
  try {
    const fetchPromise = (async () => {
      const snapshot = await getDocs(collection(db, path));
      const items: string[] = [];
      snapshot.forEach(doc => {
        items.push(doc.id);
      });
      return items;
    })();

    let dbCategories = await withTimeout(fetchPromise, 2500);

    // Auto-seed default categories if Firestore is completely empty
    if (dbCategories.length === 0) {
      console.log('Firebase store has no categories, auto-seeding default categories...');
      const seedPromises = INITIAL_CATEGORIES.map(name => {
        return setDoc(doc(db, 'categories', name), { name });
      });
      await Promise.all(seedPromises);
      dbCategories = [...INITIAL_CATEGORIES];
    }

    saveLocalCategories(dbCategories);
    return dbCategories;
  } catch (err) {
    console.warn('Firestore categories fetch issue. Serving cached:', err);
  }
  return getLocalCategories();
}

export async function saveCategory(name: string, oldName?: string): Promise<void> {
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

  const path = 'categories';
  try {
    const syncPromise = (async () => {
      await setDoc(doc(db, path, name), { name });

      if (oldName && oldName !== name) {
        await deleteDoc(doc(db, path, oldName));

        // Mass updates for affected products in categories
        const q = query(collection(db, 'products'));
        const snp = await getDocs(q);
        const updates: Promise<void>[] = [];
        snp.forEach(d => {
          if (d.data().category === oldName) {
            updates.push(updateDoc(doc(db, 'products', d.id), { category: name }));
          }
        });
        await Promise.all(updates);
      }
    })();

    await withTimeout(syncPromise, 3000).catch(err => {
      handleFirestoreError(err, OperationType.WRITE, path);
    });
  } catch (err) {
    console.warn('Firestore category sync failed (retained cache):', err);
  }
}

export async function deleteCategory(name: string): Promise<void> {
  const localCats = getLocalCategories();
  saveLocalCategories(localCats.filter(c => c !== name));

  const path = 'categories';
  try {
    const deletePromise = deleteDoc(doc(db, path, name));
    await withTimeout(deletePromise, 1500).catch(err => {
      handleFirestoreError(err, OperationType.DELETE, `${path}/${name}`);
    });
  } catch (err) {
    console.warn('Firestore category delete failed:', err);
  }
}

export async function saveProduct(product: Product): Promise<void> {
  const localProds = getLocalProducts();
  const updatedProds = [...localProds];
  
  if (!product.id || product.id.startsWith('local-') || product.id.length < 5) {
    product.id = typeof crypto !== 'undefined' && 'randomUUID' in crypto 
      ? (crypto as any).randomUUID() 
      : `prod-${Math.random().toString(36).substring(2, 11)}`;
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

  const path = 'products';
  try {
    const syncPromise = setDoc(doc(db, path, product.id), {
      name: product.name,
      description: product.description,
      price: Number(product.price),
      category: product.category,
      images: product.images,
      stockStatus: product.stockStatus,
      isFeatured: !!product.isFeatured,
      isTrending: !!product.isTrending,
      specifications: product.specifications || {},
      createdAt: Number(product.createdAt || Date.now()),
      views: Number(product.views || 0)
    });

    await withTimeout(syncPromise, 3000).catch(err => {
      handleFirestoreError(err, OperationType.WRITE, `${path}/${product.id}`);
    });
  } catch (err) {
    console.warn('Firestore product sync failed (retained cache):', err);
  }
}

export async function deleteProduct(id: string): Promise<void> {
  const localProds = getLocalProducts();
  saveLocalProducts(localProds.filter(p => p.id !== id));

  const path = 'products';
  try {
    const deletePromise = deleteDoc(doc(db, path, id));
    await withTimeout(deletePromise, 1800).catch(err => {
      handleFirestoreError(err, OperationType.DELETE, `${path}/${id}`);
    });
  } catch (err) {
    console.warn('Firestore product delete issue:', err);
  }
}

export async function incrementProductViews(id: string): Promise<void> {
  const localProds = getLocalProducts();
  const idx = localProds.findIndex(p => p.id === id);
  if (idx !== -1) {
    localProds[idx].views = (localProds[idx].views || 0) + 1;
    saveLocalProducts(localProds);
  }

  const path = 'products';
  try {
    const updatePromise = (async () => {
      const docRef = doc(db, path, id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const nextViews = Number(docSnap.data().views || 0) + 1;
        await updateDoc(docRef, { views: nextViews });
      }
    })();
    await withTimeout(updatePromise, 1500).catch(err => {
      handleFirestoreError(err, OperationType.UPDATE, `${path}/${id}`);
    });
  } catch (err) {
    console.warn('Firestore individual view update failed:', err);
  }
}

export async function incrementSiteViews(): Promise<void> {
  try {
    const localProds = getLocalProducts();
    if (localProds.length > 0) {
      localProds[0].views = (localProds[0].views || 0) + 1;
      saveLocalProducts(localProds);

      const docRef = doc(db, 'products', localProds[0].id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const nextViews = Number(docSnap.data().views || 0) + 1;
        await updateDoc(docRef, { views: nextViews });
      }
    }
  } catch (e) {
    console.warn('Failed site-wide view increment in background', e);
  }
}

export async function resetDB(): Promise<void> {
  console.log('Resetting Firebase store...');

  try {
    saveLocalProducts(INITIAL_PRODUCTS);
    saveLocalCategories(INITIAL_CATEGORIES);

    const syncPromise = (async () => {
      const productsSnap = await getDocs(collection(db, 'products'));
      const productDeletes: Promise<void>[] = [];
      productsSnap.forEach(d => {
        productDeletes.push(deleteDoc(doc(db, 'products', d.id)));
      });
      await Promise.all(productDeletes);

      const categoriesSnap = await getDocs(collection(db, 'categories'));
      const categoryDeletes: Promise<void>[] = [];
      categoriesSnap.forEach(d => {
        categoryDeletes.push(doc(db, 'categories', d.id) ? deleteDoc(doc(db, 'categories', d.id)) : Promise.resolve());
      });
      await Promise.all(categoryDeletes);

      const catSeeds = INITIAL_CATEGORIES.map(name => {
        return setDoc(doc(db, 'categories', name), { name });
      });
      await Promise.all(catSeeds);

      const prodSeeds = INITIAL_PRODUCTS.map(p => {
        return setDoc(doc(db, 'products', p.id), {
          name: p.name,
          description: p.description,
          price: Number(p.price),
          category: p.category,
          images: p.images,
          stockStatus: p.stockStatus,
          isFeatured: !!p.isFeatured,
          isTrending: !!p.isTrending,
          specifications: p.specifications || {},
          createdAt: Number(p.createdAt || Date.now()),
          views: 0
        });
      });
      await Promise.all(prodSeeds);
    })();

    await withTimeout(syncPromise, 6000).catch(err => {
      handleFirestoreError(err, OperationType.WRITE, 'reset');
    });

    alert('Database successfully reset to defaults!');
  } catch (err) {
    console.error('Remote reset failure:', err);
    alert('Failed to reset remote Firebase database, but local configurations are cleared.');
  }
}

export function subscribeProducts(onChange: (products: Product[]) => void): () => void {
  const path = 'products';
  const q = query(collection(db, path), orderBy('createdAt', 'desc'));
  
  return onSnapshot(q, (snapshot) => {
    const items: Product[] = [];
    snapshot.forEach(docSnap => {
      const d = docSnap.data();
      items.push({
        id: docSnap.id,
        name: d.name || '',
        description: d.description || '',
        price: Number(d.price || 0),
        category: d.category || '',
        images: d.images || [],
        stockStatus: d.stockStatus || 'in-stock',
        isFeatured: !!d.isFeatured,
        isTrending: !!d.isTrending,
        specifications: d.specifications || {},
        createdAt: Number(d.createdAt || Date.now()),
        views: Number(d.views || 0)
      });
    });
    
    if (items.length > 0) {
      saveLocalProducts(items);
      onChange(items);
    } else {
      onChange(getLocalProducts());
    }
  }, (err) => {
    console.error("Products subscription error:", err);
  });
}

export function subscribeCategories(onChange: (categories: string[]) => void): () => void {
  const path = 'categories';
  return onSnapshot(collection(db, path), (snapshot) => {
    const items: string[] = [];
    snapshot.forEach(docSnap => {
      items.push(docSnap.id);
    });
    if (items.length > 0) {
      saveLocalCategories(items);
      onChange(items);
    } else {
      onChange(getLocalCategories());
    }
  }, (err) => {
    console.error("Categories subscription error:", err);
  });
}
