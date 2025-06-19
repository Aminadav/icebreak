import React, { useEffect, useState } from 'react';

interface OneAnswerFeedbackProps {
  text: string;
  isCorrect: boolean;
  howManyUsers: number;
  totalUsers: number;
  showAnswers: boolean;
  startAnimation:boolean
}

export default function OneAnswerFeedback({ 
  text, 
  isCorrect, 
  howManyUsers, 
  totalUsers, 
  showAnswers,
  startAnimation
}: OneAnswerFeedbackProps): JSX.Element {
  const [isAnimated, setIsAnimated] = useState(true);
  const [progressWidth, setProgressWidth] = useState(0);

  // Calculate percentage for progress bar
  const percentage = totalUsers > 0 ? (howManyUsers / totalUsers) * 100 : 0;
  // Minimum width should be at least 11.485% (width of number area)
  const minWidth = 11.485;
  const finalWidth = Math.max(percentage, minWidth);


  useEffect(() => {
    if (!startAnimation) return;
    
    // Start animation after index-based delay (200ms between each)
    const timer = setTimeout(() => {
      setIsAnimated(true);
      // Start with minimum width, then animate to final width
      setProgressWidth(0);
      setTimeout(() => {
        setProgressWidth(finalWidth);
      }, 1);
    }, 50);

    return () => clearTimeout(timer);
  }, [showAnswers, finalWidth, minWidth,startAnimation]);

  return (
    <div 
      className={`
        relative bg-black h-[73px] w-full transition-all duration-200 ease-out
        ${isAnimated ? 'opacity-100' : 'opacity-0'}
        ${!isCorrect ? 'opacity-60' : ''}
        ${isCorrect ? 'border-2 border-green-400 bg-green-900 bg-opacity-20 font-bold' : 'border border-white'}
      `}
    >
      {/* Progress Bar Background - animates from right to left */}
      <div 
        className={`
          absolute bottom-0 top-[2.74%] right-0 transition-all duration-1200 ease-out
          ${isCorrect ? 'bg-green-400' : 'bg-orange-400'}
        `}
        style={{ 
          width: `${progressWidth}%`,
          transformOrigin: 'right center'
        }}
      />
      
      {/* Answer Text */}
      <div className={`
        absolute inset-0 flex items-center justify-center text-white text-[28px] text-center z-10
        ${isCorrect ? 'font-bold drop-shadow-lg' : 'font-normal'}
      `}>
        <p className="leading-normal">{text}</p>
      </div>
      
      {/* User Count - On top of progress bar, no background */}
      <div className={`
        absolute bottom-0 top-0 right-0 left-[88.515%] flex items-center justify-center text-black text-[28px] font-bold z-20
      `}>
        <p className="leading-normal">{howManyUsers}</p>
      </div>
      
      {/* Correct/Incorrect Icon */}
      <div className="absolute bottom-[20.064%] left-[4.762%] right-[82.749%] top-[20.548%] z-30">
        {isCorrect ? (
          <div className="flex items-center justify-center w-full h-full">
            <svg 
              className={`w-full h-full text-green-400 ${isAnimated ? 'animate-bounce' : ''}`}
              fill="currentColor" 
              viewBox="0 0 20 20"
            >
              <path 
                fillRule="evenodd" 
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" 
                clipRule="evenodd" 
              />
            </svg>
          </div>
        ) : (
          <div className="flex items-center justify-center w-full h-full">
            <svg 
              className="w-full h-full text-red-500 opacity-75" 
              fill="currentColor" 
              viewBox="0 0 20 20"
            >
              <path 
                fillRule="evenodd" 
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" 
                clipRule="evenodd" 
              />
            </svg>
          </div>
        )}
      </div>
    </div>
  );
}
