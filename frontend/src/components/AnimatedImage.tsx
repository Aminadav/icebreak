import React from 'react';

interface AnimatedImageProps {
  src: string;
  alt: string;
  className?: string;
  size?: 'small' | 'medium' | 'large' | 'custom';
}

export default function AnimatedImage({ 
  src, 
  alt, 
  className = '', 
  size = 'medium' 
}: AnimatedImageProps): JSX.Element {
  
  const getSizeClasses = () => {
    switch (size) {
      case 'small':
        return 'w-24 h-24';
      case 'medium':
        return 'w-28 h-28';
      case 'large':
        return 'w-80 h-auto';
      case 'custom':
        return '';
      default:
        return 'w-32 h-32';
    }
  };

  const handleAnimationEnd = (e: React.AnimationEvent<HTMLImageElement>) => {
    if (e.animationName === 'float-in') {
      e.currentTarget.style.animation = 'gentle-float 3s ease-in-out infinite';
    }
  };

  return (
    <div className="mb-4 drop-shadow-2xl">
      <img 
        src={src}
        alt={alt}
        className={`${getSizeClasses()} max-w-full animate-float-in hover:scale-105 hover:drop-shadow-[0_20px_30px_rgba(255,165,0,0.3)] transition-all duration-300 ease-out filter brightness-105 ${className}`}
        style={{
          animationDelay: '0.3s',
          animationFillMode: 'both'
        }}
        onAnimationEnd={handleAnimationEnd}
      />
    </div>
  );
}
