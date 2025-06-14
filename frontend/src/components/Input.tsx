import React from 'react';

interface InputProps {
  type?: 'text' | 'tel' | 'email' | 'password' | 'number';
  value: string;
  onChange: (value: string) => void;
  onKeyPress?: (e: React.KeyboardEvent) => void;
  placeholder?: string;
  className?: string;
  autoFocus?: boolean;
  disabled?: boolean;
}

export default function Input({
  type = 'text',
  value,
  onChange,
  onKeyPress,
  placeholder,
  className = '',
  autoFocus = false,
  disabled = false
}: InputProps): JSX.Element {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  return (
    <div className={`w-full max-w-md ${className}`}>
      <input
        type={type}
        value={value}
        onChange={handleChange}
        onKeyPress={onKeyPress}
        placeholder={placeholder}
        className="w-full px-6 py-4 text-xl text-center transition-all duration-200 bg-white border-4 border-white shadow-lg rounded-2xl focus:outline-none focus:ring-4 focus:ring-orange-300 focus:border-orange-400 disabled:opacity-50 disabled:cursor-not-allowed"
        autoFocus={autoFocus}
        disabled={disabled}
      />
    </div>
  );
}
