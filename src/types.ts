/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  images: string[];
  stockStatus: 'in-stock' | 'out-of-stock';
  isFeatured?: boolean;
  isTrending?: boolean;
  specifications: Record<string, string>;
  createdAt: number;
  views?: number;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface AdminSettings {
  isLoggedIn: boolean;
  seoTitle: string;
  seoDescription: string;
}
