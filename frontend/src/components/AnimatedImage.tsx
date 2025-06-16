import React from 'react';

interface AnimatedImageProps {
  src: string;
  alt: string;
  className?: string;
  size?: 'small' | 'medium' | 'large' | 'custom';
  width?: number;
  height?: number;
}

export default function AnimatedImage({ 
  src, 
  alt, 
  className = '', 
  size = 'medium',
  width,
  height
}: AnimatedImageProps): JSX.Element {
  
  const getSizeClasses = () => {
    switch (size) {
      case 'small':
        return 'w-24 h-24';
      case 'medium':
        return 'w-32 h-32';
      case 'large':
        return 'w-80 h-60'; // Fixed height for large images
      case 'custom':
        return '';
      default:
        return 'w-32 h-32';
    }
  };

  const getContainerStyle = () => {
    const style: React.CSSProperties = {};
    
    // If explicit dimensions are provided, use them
    if (width && height) {
      style.width = `${width}px`;
      style.height = `${height}px`;
    } else if (size === 'large') {
      // Predefined dimensions for large images to prevent layout shift
      style.width = '320px';
      style.height = '240px';
    }
    
    return style;
  };

  const handleAnimationEnd = (e: React.AnimationEvent<HTMLImageElement>) => {
    if (e.animationName === 'float-in-stable') {
      e.currentTarget.style.animation = 'gentle-float 3s ease-in-out infinite';
    }
  };

  return (
    <div 
      className={`mb-8 drop-shadow-2xl ${width || height || (size === 'large') ? '' : getSizeClasses()}`}
      style={getContainerStyle()}
    >
      <img 
        src={src}
        alt={alt}
        className={`w-full h-full object-contain animate-float-in-stable hover:scale-105 hover:drop-shadow-[0_20px_30px_rgba(255,165,0,0.3)] transition-all duration-300 ease-out cursor-pointer filter brightness-105 ${className}`}
        style={{
          animationDelay: '0.3s',
          animationFillMode: 'both'
        }}
        onAnimationEnd={handleAnimationEnd}
      />
    </div>
  );
}
