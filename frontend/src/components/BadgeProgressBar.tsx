import { useEffect, useState, useRef } from "react";
import { useIsVisible } from "../hooks/useIsVisible";

interface ProgressBarProps {
  percentage: number;
  animated?: boolean;
}

export function BadgeProgressBar({ percentage, animated = true }: ProgressBarProps) {
  const [displayPercentage, setDisplayPercentage] = useState(0);
  const progressBarRef = useRef<HTMLDivElement>(null);
  const isVisible = useIsVisible(progressBarRef);

  useEffect(() => {
    if (animated && isVisible) {
      const timer = setTimeout(() => {
        setDisplayPercentage(percentage);
      }, 500);
      return () => clearTimeout(timer);
    } else if (!animated) {
      setDisplayPercentage(percentage);
    }
  }, [percentage, animated, isVisible]);

  return (
    <div ref={progressBarRef} className="relative w-full">
      <div className="bg-[#d9d9d9] relative rounded-[27px] h-[18px] w-full" />
      <div 
        className="bg-[#539203] absolute top-0 left-0 rounded-[27px] h-[18px] transition-all duration-1000 ease-out"
        style={{ width: `${displayPercentage}%` }}
      />
    </div>
  );
}