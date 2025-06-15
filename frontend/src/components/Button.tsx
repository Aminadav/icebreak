import React, { useState, useEffect } from 'react';
import { useTracking } from '../contexts/TrackingContext';

export type ButtonVariant = 
  | 'primary' 
  | 'secondary' 
  | 'ghost' 
  | 'disabled' 
  | 'primary-large' 
  | 'seoncdary-small' 
  | 'outline-purple' 
  | 'outline-purple-icon';

interface ButtonProps {
  variant: ButtonVariant;
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
  icon?: React.ReactNode;
  trackingId?: string;
  'data-testid'?: string;
}

const buttonVariants = {
  primary: `
    bg-gradient-to-r from-orange-400 to-orange-500 
    text-white font-semibold py-3 px-8 rounded-2xl
    hover:from-orange-500 hover:to-orange-600 
    hover:scale-105
    active:scale-95
    transition-all duration-200 ease-in-out
    border-2 border-orange-300
  `,
  secondary: `
    bg-transparent border-2 border-white 
    text-white font-semibold py-3 px-8 rounded-2xl
    hover:bg-white hover:text-purple-700 
    hover:scale-105
    active:scale-95 active:bg-gray-100
    transition-all duration-200 ease-in-out
  `,
  ghost: `
    bg-transparent text-white font-semibold py-3 px-8
    hover:bg-white hover:bg-opacity-20 
    hover:scale-105
    active:scale-95 active:bg-opacity-30
    transition-all duration-200 ease-in-out
    underline decoration-2 underline-offset-4
  `,
  disabled: `
    bg-gray-300 text-gray-500 font-semibold py-3 px-8 rounded-2xl
    cursor-not-allowed opacity-60
    border-2 border-gray-200
  `,
  'primary-large': `
    bg-gradient-to-r from-orange-400 to-orange-500 
    text-white font-semibold py-4 px-8 rounded-3xl
    hover:from-orange-500 hover:to-orange-600 
    hover:scale-105
    active:scale-95
    transition-all duration-200 ease-in-out
    border-6 border-white
    flex items-center justify-center gap-3
    min-h-[60px]
  `,
  'seoncdary-small': `
    bg-gradient-to-r from-orange-400 to-orange-500 
    text-white font-semibold py-2 px-6 rounded-xl
    hover:from-orange-500 hover:to-orange-600 
    hover:scale-105
    active:scale-95
    transition-all duration-200 ease-in-out
    border-2 border-orange-300
    flex items-center justify-center gap-2
    text-sm
  `,
  'outline-purple': `
    bg-transparent border-2 border-purple-400 
    text-white font-semibold py-3 px-8 rounded-2xl
    hover:bg-purple-500 hover:border-purple-500 
    hover:scale-105
    active:scale-95 active:bg-purple-600
    transition-all duration-200 ease-in-out
  `,
  'outline-purple-icon': `
    bg-transparent border-2 border-purple-400 
    text-white font-semibold py-3 px-8 rounded-2xl
    hover:bg-purple-500 hover:border-purple-500 
    hover:scale-105
    active:scale-95 active:bg-purple-600
    transition-all duration-200 ease-in-out
    flex items-center justify-center gap-2
  `
};

export default function Button({ 
  variant, 
  children, 
  onClick, 
  disabled = false, 
  className = '',
  icon,
  trackingId,
  'data-testid': testId
}: ButtonProps) {
  const [isVisible, setIsVisible] = useState(false);
  const { trackEvent } = useTracking();
  
  useEffect(() => {
    // הוספת עיכוב קטן כדי שהאפקט יתחיל אחרי שהקומפוננטה נטענת
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);
  
  const isDisabled = disabled || variant === 'disabled';
  
  const handleClick = () => {
    // Track the button click if trackingId is provided
    if (trackingId) {
      trackEvent(trackingId, {
        variant,
        buttonText: typeof children === 'string' ? children : 'non-text-content',
        hasIcon: !!icon
      });
    }
    
    // Call the original onClick handler
    if (!isDisabled && onClick) {
      onClick();
    }
  };
  
  return (
    <div 
      style={{
        margin: '4px',
      }}
    >
      <button
        onClick={handleClick}
        disabled={isDisabled}
        data-testid={testId}
        className={`
          ${buttonVariants[variant]}
          ${className}
          select-none
          transform
          will-change-transform
          w-full
        `}
        style={{ 
          transformOrigin: 'center',
          clipPath: isVisible 
            ? 'inset(0 0 0 0)' 
            : 'inset(0 0 0 100%)',
          transition: 'clip-path 1.2s cubic-bezier(0.25, 0.46, 0.45, 0.94), transform 0.2s ease-in-out',
        }}
      >
        {icon && <span className="flex-shrink-0">{icon}</span>}
        {children}
      </button>
    </div>
  );
}