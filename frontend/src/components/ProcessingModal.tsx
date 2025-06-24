import { useState, useEffect } from 'react';
import { getIsTesting } from '../utils/isTesting';

interface ProcessingModalProps {
  isVisible: boolean;
  imageUrl: string;
  onComplete: () => void;
}

export default function ProcessingModal({ isVisible, imageUrl, onComplete }: ProcessingModalProps) {
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  
  const steps = [
    'מעלה תמונה...',
    'מתחיל יצירה...',
    'יוצר תמונות...',
    'כמעט מוכן...',
    'מסיים עיבוד...'
  ];

  useEffect(() => {
    if (!isVisible) return;

    // Handle Enter key press to close modal
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.key === 'Enter') {
        event.preventDefault();
        console.log('🎬 ProcessingModal: Enter key pressed, calling onComplete');
        onComplete();
      }
    };

    document.addEventListener('keydown', handleKeyPress);

    console.log('🎬 ProcessingModal: Starting 5-second timer');

    // Simulate progress over 5 seconds
    const totalDuration =getIsTesting() ? 500 : 5000; // 5 seconds
    const updateInterval = 100; // Update every 100ms
    const totalUpdates = totalDuration / updateInterval;
    const progressIncrement = 100 / totalUpdates;

    let currentProgress = 0;
    let stepIndex = 0;

    const interval = setInterval(() => {
      currentProgress += progressIncrement;
      
      if (currentProgress >= 100) {
        currentProgress = 100;
        setProgress(100);
        clearInterval(interval);
        
        console.log('🎬 ProcessingModal: 5 seconds completed, calling onComplete');
        // Call onComplete immediately when progress reaches 100%
        onComplete();
        return;
      }
      
      setProgress(currentProgress);
      
      // Update step based on progress
      const newStepIndex = Math.floor((currentProgress / 100) * steps.length);
      if (newStepIndex !== stepIndex && newStepIndex < steps.length) {
        stepIndex = newStepIndex;
        setCurrentStep(stepIndex);
      }
    }, updateInterval);

    return () => {
      console.log('🎬 ProcessingModal: Cleanup - clearing interval');
      clearInterval(interval);
      document.removeEventListener('keydown', handleKeyPress);
    };
  }, [isVisible, onComplete]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="relative w-full max-w-md mx-4 overflow-hidden bg-gray-900 shadow-2xl rounded-3xl">
        
        {/* Background Image */}
        {imageUrl && (
          <div 
            className="absolute inset-0 bg-center bg-cover"
            style={{
              backgroundImage: `url(${imageUrl})`,
              filter: 'blur(8px) brightness(0.3)',
              transform: 'scaleX(-1)' // Mirror to match camera preview
            }}
          />
        )}
        
        {/* Dark Overlay */}
        <div className="absolute inset-0 bg-black/60" />
        
        {/* Content */}
        <div className="relative z-10 p-8 text-center">
          
          {/* Main Text */}
          <div className="mb-8">
            <h1 className="mb-4 text-3xl font-bold text-white">
              מוכנים?
            </h1>
            <div className="text-xl text-white">
              זה{' '}
              <span className="text-3xl font-extrabold text-orange-500 align-sub">באמת</span>
              {' '}עומד
            </div>
            <div className="mt-2 text-xl text-white">
              להיות מטורף
            </div>
            {JSON.stringify({isTesting: getIsTesting()})}
          </div>

          {/* Scanning Animation */}
          <div className="flex items-center justify-center mb-6">
            <img 
              src="/videos/scanning-effect.gif" 
              alt="Scanning effect"
              className="w-24 h-24 opacity-80"
            />
          </div>

          {/* Progress */}
          <div className="mb-4">
            <div className="mb-2 text-sm font-medium text-white/90">
              {steps[currentStep]}
            </div>
            <div className="w-full h-2 bg-gray-700 rounded-full">
              <div 
                className="h-2 transition-all duration-300 ease-out bg-orange-500 rounded-full"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="mt-1 text-xs text-white/70">
              {Math.round(progress)}%
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
