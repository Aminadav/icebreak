import { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import Answer from './Answer';

interface AnswerData {
  id: string;
  text: string;
  selected?: boolean;
}

interface AnswerContainerProps {
  answers: AnswerData[];
  onAnswerClick?: (answerId: string, value?: string) => void;
  disabled?: boolean;
  maxAnswers?: number;
  allowOther?: boolean;
  onOtherAnswerChange?: (value: string) => void;
  otherAnswerValue?: string;
}

export default function AnswerContainer({ 
  answers, 
  onAnswerClick, 
  disabled = false, 
  maxAnswers = 4,
  allowOther = false,
  onOtherAnswerChange,
  otherAnswerValue = ''
}: AnswerContainerProps): JSX.Element {
  const { texts } = useLanguage();
  const isRTL = texts.direction === 'rtl';
  const [showOtherInput, setShowOtherInput] = useState(false);
  const [isOtherSelected, setIsOtherSelected] = useState(false);
  
  // Limit answers to maxAnswers
  const displayedAnswers = answers.slice(0, maxAnswers);
  
  const handleAnswerClick = (answerId: string, value?: string) => {
    if (answerId === 'other') {
      setIsOtherSelected(true);
      if (value && onOtherAnswerChange) {
        onOtherAnswerChange(value);
      }
    } else {
      setIsOtherSelected(false);
    }
    
    if (onAnswerClick) {
      onAnswerClick(answerId, value);
    }
  };

  const handleOtherChange = (value: string) => {
    // Ensure other is selected when user starts typing
    if (!isOtherSelected) {
      setIsOtherSelected(true);
      if (onAnswerClick) {
        onAnswerClick('other');
      }
    }
    
    if (onOtherAnswerChange) {
      onOtherAnswerChange(value);
    }
  };

  // Determine grid layout based on number of answers
  const getGridClasses = () => {
    const count = displayedAnswers.length;
    if (count === 1) return 'grid-cols-1 max-w-md';
    if (count === 2) return 'grid-cols-1 sm:grid-cols-2 max-w-2xl';
    if (count === 3) return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 max-w-4xl';
    return 'grid-cols-1 sm:grid-cols-2 max-w-3xl';
  };

  const getContainerClasses = () => {
    const baseClasses = `
      grid gap-4 w-full mx-auto p-4
      transition-all duration-500 ease-in-out
    `;
    return `${baseClasses} ${getGridClasses()}`;
  };

  return (
    <div 
      className={getContainerClasses()}
      style={{ direction: isRTL ? 'rtl' : 'ltr' }}
    >
      {displayedAnswers.map((answer, index) => (
        <div
          key={answer.id}
          className={`
            transform transition-all duration-500 ease-out
            hover:z-10 relative animate-fadeInUp group
          `}
          style={{
            animationDelay: `${index * 150}ms`,
            animationFillMode: 'both',
          }}
        >
          <div className="transition-all duration-300 transform group-hover:scale-105">
            <Answer
              text={answer.text}
              onClick={(value) => handleAnswerClick(answer.id, value)}
              disabled={disabled}
              selected={answer.selected}
            />
          </div>
          
          {/* Floating animation for selected answer */}
          {answer.selected && (
            <div className="absolute -inset-2 bg-gradient-to-r from-cyan-400/20 to-purple-400/20 rounded-[12px] animate-pulse -z-10" />
          )}
        </div>
      ))}
      
      {allowOther && (
        <div
          className={`
            transform transition-all duration-500 ease-out
            hover:z-10 relative animate-fadeInUp group
          `}
          style={{
            animationDelay: `${displayedAnswers.length * 150}ms`,
            animationFillMode: 'both',
          }}
        >
          <div className="transition-all duration-300 transform group-hover:scale-105">
            <Answer
              text="הקלד תשובה אחרת ..."
              onClick={(value) => handleAnswerClick('other', value)}
              onChange={handleOtherChange}
              disabled={disabled}
              selected={isOtherSelected}
              allow_free_text={true}
            />
          </div>
          
          {/* Floating animation for selected answer */}
          {isOtherSelected && (
            <div className="absolute -inset-2 bg-gradient-to-r from-cyan-400/20 to-purple-400/20 rounded-[12px] animate-pulse -z-10" />
          )}
        </div>
      )}    
    </div>
  );
}
