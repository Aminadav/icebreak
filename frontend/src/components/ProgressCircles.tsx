interface ProgressCirclesProps {
  total: number;
  current: number;
  className?: string;
}

export default function ProgressCircles({ total = 5, current = 1, className = '' }: ProgressCirclesProps): JSX.Element {
  return (
    <div className={`flex justify-center gap-4 mb-8 ${className}`}>
      {Array.from({ length: total }).map((_, index) => {
        const circleNumber = index + 1;
        const isActive = circleNumber <= current;
        const isCurrent = circleNumber === current;
        
        return (
          <div
            key={circleNumber}
            className={`
              w-12 h-12 rounded-full flex items-center justify-center
              font-bold text-lg transition-all duration-300
              ${isActive 
                ? (isCurrent 
                    ? 'bg-orange-400 text-white shadow-lg scale-110' 
                    : 'bg-white text-purple-700'
                  ) 
                : 'bg-white text-gray-400'
              }
              ${isCurrent ? 'ring-4 ring-orange-300 ring-opacity-50' : ''}
            `}
          >
            {isActive && !isCurrent ? '✓' : circleNumber}
          </div>
        );
      })}
    </div>
  );
}
