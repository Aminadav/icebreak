import { useLanguage } from '../contexts/LanguageContext';
import Answer from './Answer';

interface AnswerData {
  id: string;
  text: string;
  selected?: boolean;
}

interface AnswerContainerProps {
  answers: AnswerData[];
  onAnswerClick?: (answerId: string) => void;
  disabled?: boolean;
  maxAnswers?: number;
}

export default function AnswerContainer({ 
  answers, 
  onAnswerClick, 
  disabled = false, 
  maxAnswers = 4 
}: AnswerContainerProps): JSX.Element {
  const { texts } = useLanguage();
  const isRTL = texts.direction === 'rtl';
  
  // Limit answers to maxAnswers
  const displayedAnswers = answers.slice(0, maxAnswers);
  
  const handleAnswerClick = (answerId: string) => {
    if (onAnswerClick) {
      onAnswerClick(answerId);
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
          <div className="transform transition-all duration-300 group-hover:scale-105">
            <Answer
              text={answer.text}
              onClick={() => handleAnswerClick(answer.id)}
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
    </div>
  );
}
