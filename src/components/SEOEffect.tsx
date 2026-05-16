import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export const SEOEffect = () => {
  const location = useLocation();

  useEffect(() => {
    const defaultTitle = "Dubai Bazar | The Place of Old Dreams";
    const defaultDesc = "Gadgets, collectibles, gaming accessories, and unique tech imports in Karachi. Order via WhatsApp.";
    
    // In a real app, we might fetch this from the same IndexedDB store
    const savedSEO = JSON.parse(localStorage.getItem('dubai-bazar-seo') || '{}');
    
    document.title = savedSEO.title || defaultTitle;
    
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute('content', savedSEO.description || defaultDesc);
    } else {
      const meta = document.createElement('meta');
      meta.name = "description";
      meta.content = savedSEO.description || defaultDesc;
      document.head.appendChild(meta);
    }
  }, [location]);

  return null;
};
