import React from 'react';
import { useTracking } from '../contexts/TrackingContext';

interface InputProps {
  type?: 'text' | 'tel' | 'email' | 'password' | 'number';
  value: string;
  onChange: (value: string) => void;
  onKeyPress?: (e: React.KeyboardEvent) => void;
  placeholder?: string;
  className?: string;
  autoFocus?: boolean;
  disabled?: boolean;
  inputMode?: 'none' | 'text' | 'decimal' | 'numeric' | 'tel' | 'search' | 'email' | 'url';
  autoComplete?: string;
  trackingId?: string;
  'data-testid'?: string;
}

export default function Input({
  type = 'text',
  value,
  onChange,
  onKeyPress,
  placeholder,
  className = '',
  autoFocus = false,
  disabled = false,
  inputMode,
  autoComplete,
  trackingId,
  'data-testid': testId
}: InputProps): JSX.Element {
  const { trackEvent } = useTracking();
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
    
    // Track input changes if trackingId is provided
    if (trackingId) {
      trackEvent(`${trackingId}_input_changed`, {
        input_type: type,
        input_length: e.target.value.length,
        has_value: !!e.target.value.trim(),
        placeholder: placeholder
      });
    }
  };
  
  const handleFocus = () => {
    if (trackingId) {
      trackEvent(`${trackingId}_input_focused`, {
        input_type: type,
        placeholder: placeholder
      });
    }
  };

  // Auto-detect inputMode based on type if not provided
  const finalInputMode = inputMode || (type === 'tel' ? 'tel' : type === 'number' ? 'numeric' : 'text');

  return (
    <div className={`w-full max-w-md ${className}`}>
      <input
        type={type}
        value={value}
        onChange={handleChange}
        onKeyPress={onKeyPress}
        onFocus={handleFocus}
        placeholder={placeholder}
        className="w-full px-6 py-4 text-xl text-center transition-all duration-200 bg-white border-4 border-white shadow-lg rounded-2xl focus:outline-none focus:ring-4 focus:ring-orange-300 focus:border-orange-400 disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation"
        autoFocus={autoFocus}
        disabled={disabled}
        inputMode={finalInputMode}
        autoComplete={autoComplete}
        data-testid={testId}
      />
    </div>
  );
}
