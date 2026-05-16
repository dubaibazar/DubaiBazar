import { Product } from './types';

export const BUSINESS_INFO = {
  name: 'Dubai Bazar',
  tagline: 'Karachi Elite Tech',
  location: 'Jackson Bazar, Kemari, Karachi, Pakistan',
  whatsapp: '03073992661',
  whatsappGroup: 'https://chat.whatsapp.com/BfTXVDBNr6x5UPw8AaoZSg',
};

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'Retro Gaming Console R36S',
    description: 'Portable handheld console with 15,000+ classic games. High-quality IPS screen and long battery life.',
    price: 8500,
    category: 'Gaming',
    images: ['https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=2070&auto=format&fit=crop'],
    stockStatus: 'in-stock',
    isFeatured: true,
    specifications: {
      'Screen': '3.5 inch IPS',
      'Battery': '3500mAh',
      'Storage': '64GB TF Card',
    },
    createdAt: Date.now(),
  },
  {
    id: '2',
    name: 'Cyberpunk LED Desk Lamp',
    description: 'Futuristic lighting with multiple RGB modes. Perfect for gaming setups and room décor.',
    price: 4500,
    category: 'Décor',
    images: ['https://images.unsplash.com/photo-1614859324967-bdf281fb1cf1?q=80&w=2070&auto=format&fit=crop'],
    stockStatus: 'in-stock',
    isTrending: true,
    specifications: {
      'Height': '30cm',
      'Power': 'USB-C',
      'Modes': '16.8 Million Colors',
    },
    createdAt: Date.now(),
  },
  {
    id: '3',
    name: 'Mechanical Cat Figure',
    description: 'Limited edition robotic-style collectible figure. Highly detailed and imported.',
    price: 3200,
    category: 'Collectibles',
    images: ['https://images.unsplash.com/photo-1566576721346-d4a3b4eaeb55?q=80&w=2070&auto=format&fit=crop'],
    stockStatus: 'in-stock',
    specifications: {
      'Material': 'High-density PVC',
      'Articulation': 'Fixed',
      'Height': '15cm',
    },
    createdAt: Date.now(),
  },
  {
    id: '4',
    name: 'RGB Mechanical Keyboard',
    description: 'Clicky blue switches with customizable backlight. Durable and fast for gaming.',
    price: 6500,
    category: 'PC Accessories',
    images: ['https://images.unsplash.com/photo-1511467687858-23d96c32e4ae?q=80&w=2070&auto=format&fit=crop'],
    stockStatus: 'in-stock',
    isFeatured: true,
    specifications: {
      'Switches': 'Blue Outemu',
      'Layout': '60% Compact',
      'Connectivity': 'Wired USB',
    },
    createdAt: Date.now(),
  }
];
