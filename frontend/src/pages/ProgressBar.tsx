import { useEffect, useState } from "react";

interface ProgressBarProps {
  percentage: number;
  animated?: boolean;
}

export function ProgressBar({ percentage, animated = true }: ProgressBarProps) {
  const [displayPercentage, setDisplayPercentage] = useState(0);

  useEffect(() => {
    if (animated) {
      const timer = setTimeout(() => {
        setDisplayPercentage(percentage);
      }, 500);
      return () => clearTimeout(timer);
    } else {
      setDisplayPercentage(percentage);
    }
  }, [percentage, animated]);

  return (
    <div className="relative w-full">
      <div className="bg-[#d9d9d9] relative rounded-[27px] h-[18px] w-full" />
      <div 
        className="bg-[#539203] absolute top-0 left-0 rounded-[27px] h-[18px] transition-all duration-1000 ease-out"
        style={{ width: `${displayPercentage}%` }}
      />
    </div>
  );
}