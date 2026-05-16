import React from 'react';
import { ShoppingBag } from 'lucide-react';
import { cn } from '../../lib/utils';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
}

export const Logo: React.FC<LogoProps> = ({ className, size = 'md', showText = true }) => {
  const [imgSrc, setImgSrc] = React.useState<string>('/logo.png');
  const [imageError, setImageError] = React.useState(false);
  
  const handleImageError = () => {
    setImageError(true);
  };

  const sizes = {
    sm: { icon: 16, text: 'text-sm', container: 'h-8' },
    md: { icon: 24, text: 'text-xl', container: 'h-12' },
    lg: { icon: 32, text: 'text-2xl', container: 'h-16' },
    xl: { icon: 48, text: 'text-4xl', container: 'h-24' },
  };

  const currentSize = sizes[size];

  return (
    <div className={cn("flex items-center gap-3", className)}>
      <div className={cn(
        "flex items-center justify-center rounded-xl shadow-lg shrink-0 overflow-hidden",
        !imageError && "bg-transparent",
        imageError && "bg-orange-600 text-white shadow-orange-100",
        currentSize.container,
        size === 'sm' ? 'w-8' : size === 'md' ? 'w-12' : size === 'lg' ? 'w-16' : 'w-24'
      )}>
        {!imageError ? (
          <img 
            src={imgSrc} 
            alt="Dubai Bazar" 
            className="w-full h-full object-contain"
            fetchpriority="high"
            loading="eager"
            onError={handleImageError}
          />
        ) : (
          <ShoppingBag size={currentSize.icon} />
        )}
      </div>
      
      {showText && (
        <div className="flex flex-col">
          <span className={cn("font-black tracking-tight text-slate-900 leading-tight uppercase", currentSize.text)}>
            Dubai Bazar
          </span>
          <span className="text-[10px] uppercase tracking-[0.2em] text-orange-600 font-bold -mt-0.5">
            The place of old dreams
          </span>
        </div>
      )}
    </div>
  );
};
