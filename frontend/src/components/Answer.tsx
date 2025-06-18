import { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';

interface AnswerProps {
  text: string;
  onClick?: (value?: string) => void;
  onChange?: (value: string) => void;
  disabled?: boolean;
  selected?: boolean;
  allow_free_text?: boolean;
}

export default function Answer({ text, onClick, onChange, disabled = false, selected = false, allow_free_text = false }: AnswerProps): JSX.Element {
  const { texts } = useLanguage();
  const [isPressed, setIsPressed] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [isInputMode, setIsInputMode] = useState(false);
  const isRTL = texts.direction === 'rtl';

  const handleClick = () => {
    if (disabled) return;
    
    if (allow_free_text && !isInputMode) {
      setIsInputMode(true);
      return;
    }
    
    setIsPressed(true);
    setTimeout(() => setIsPressed(false), 300);
    
    if (onClick) {
      const response = allow_free_text && isInputMode && inputValue.trim() ? inputValue : undefined;
      setTimeout(() => onClick(response), 150);
    }
  };

  const handleInputSubmit = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && inputValue.trim()) {
      if (onClick) {
        onClick(inputValue);
      }
    }
  };

  const handleInputBlur = () => {
    if (!inputValue.trim()) {
      setIsInputMode(false);
    }
  };

  return (
    <button
      className={`
        relative w-full h-[50px] bg-black text-white rounded-[8px] border-2 border-black
        font-medium text-[16px] leading-normal transition-all duration-300 ease-out
        transform-gpu overflow-hidden cursor-pointer
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105 hover:shadow-xl hover:-translate-y-1 active:scale-95'}
        ${selected ? 'ring-4 ring-cyan-400 ring-opacity-60 bg-gradient-to-r from-purple-600 to-blue-600' : ''}
        ${isPressed ? 'scale-90 shadow-inner' : ''}
        ${isHovered && !disabled ? 'bg-gradient-to-r from-gray-800 to-black' : ''}
        ${isRTL ? 'text-right' : 'text-left'}
      `}
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      disabled={disabled}
      style={{
        direction: isRTL ? 'rtl' : 'ltr',
      }}
    >
      {/* Animated background gradient */}
      <div className={`
        absolute inset-0 bg-gradient-to-r from-purple-600 via-pink-500 to-cyan-500
        opacity-0 transition-all duration-500 ease-in-out rounded-[6px]
        ${!disabled && isHovered ? 'opacity-30 animate-pulse' : ''}
      `} />
      
      {/* Floating particles effect on hover */}
      {isHovered && !disabled && (
        <>
          <div className="absolute w-1 h-1 bg-white rounded-full top-2 left-2 animate-bounce" style={{ animationDelay: '0ms' }} />
          <div className="absolute w-1 h-1 rounded-full top-3 right-3 bg-cyan-300 animate-bounce" style={{ animationDelay: '200ms' }} />
          <div className="absolute w-1 h-1 bg-purple-300 rounded-full bottom-2 left-1/3 animate-bounce" style={{ animationDelay: '400ms' }} />
          <div className="absolute w-1 h-1 bg-pink-300 rounded-full bottom-3 right-1/4 animate-bounce" style={{ animationDelay: '600ms' }} />
        </>
      )}
      
      {/* Shimmer effect on hover */}
      <div className={`
        absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent
        opacity-0 transform transition-all duration-1000 ease-in-out
        ${!disabled && isHovered ? 'translate-x-[100%] opacity-20' : 'translate-x-[-100%]'}
      `} />
      
      {/* Click burst effect */}
      {isPressed && (
        <>
          <div className="absolute inset-0 bg-white opacity-40 rounded-[6px] animate-ping" />
          <div className="absolute w-2 h-2 transform -translate-x-1/2 -translate-y-1/2 rounded-full top-1/2 left-1/2 bg-cyan-400 animate-ping" />
        </>
      )}
      
      {/* Text content with bounce effect */}
      <span className={`
        relative z-10 px-4 flex items-center justify-center h-full
        transition-all duration-300 ease-out font-semibold
        ${isPressed ? 'transform scale-95' : ''}
        ${isHovered && !disabled ? 'transform scale-105 text-shadow-lg' : ''}
      `}>
        {allow_free_text && isInputMode ? (
          <input
            type="text"
            value={inputValue}
            onChange={(e) => {
              setInputValue(e.target.value);
              if (onChange) {
                onChange(e.target.value);
              }
            }}
            onKeyDown={handleInputSubmit}
            onBlur={handleInputBlur}
            placeholder="בחר תשובה אחרת"
            className={`
              w-full bg-transparent border-none outline-none text-white placeholder-gray-300
              font-semibold text-[16px] text-center
              ${isRTL ? 'text-right' : 'text-left'}
            `}
            style={{ direction: isRTL ? 'rtl' : 'ltr' }}
            autoFocus
          />
        ) : (
          text
        )}
      </span>
      
      {/* Enhanced glow effects */}
      <div className={`
        absolute inset-0 rounded-[8px] transition-all duration-500
        ${!disabled && isHovered ? 'shadow-[0_0_30px_rgba(139,92,246,0.6),0_0_60px_rgba(59,130,246,0.3)]' : ''}
        ${selected ? 'shadow-[0_0_35px_rgba(6,182,212,0.8)]' : ''}
      `} />
      
      {/* Success state animation */}
      {selected && (
        <div className="absolute inset-0 border-2 border-cyan-400 rounded-[8px] animate-pulse" />
      )}
    </button>
  );
}
