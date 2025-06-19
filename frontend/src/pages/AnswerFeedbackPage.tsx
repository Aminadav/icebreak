import React, { useState, useEffect } from 'react';
import PageLayout from '../components/PageLayout';
import Button from '../components/Button';
import MyPoints from '../components/MyPoints';
import Footer from '../components/Footer';
import OneAnswerFeedback from '../components/OneAnswerFeedback';
import { useSocket } from '../contexts/SocketContext';
import { useGameId } from '../utils/useGameId';
import { useLanguage } from '../contexts/LanguageContext';

export default function AnswerFeedbackPage(props: {gameState: gameStateAnswerFeedback}): JSX.Element {
  const gameState = props.gameState;
  const { socket } = useSocket();
  const gameId = useGameId();
  const { texts } = useLanguage();
  const [showContinueButton, setShowContinueButton] = useState(false);
  const [animationPhase, setAnimationPhase] = useState('initial'); // 'initial', 'message', 'points', 'answers', 'complete'
  const [starScale, setStarScale] = useState(0);
  const [visibleAnswersCount, setVisibleAnswersCount] = useState(0);

  // Calculate total users who answered
  const totalUsers = gameState.answers.reduce((sum, answer) => sum + answer.howManyUsers, 0);
  
  // Check if user got the correct answer based on correctStatus
  const hasCorrectAnswer = gameState.correctStatus === "YOU_CORRECT";

  useEffect(() => {
    // Fast 3-phase animation sequence
    const timer1 = setTimeout(() => {
      setAnimationPhase('message');
    }, 200);

    const timer2 = setTimeout(() => {
      setAnimationPhase('points');
      setStarScale(1);
    }, 400);

    const timer3 = setTimeout(() => {
      setAnimationPhase('answers');
      // Start showing answers one by one
      setVisibleAnswersCount(1);
    }, 800);

    const timer4 = setTimeout(() => {
      setAnimationPhase('complete');
      setShowContinueButton(true);
    }, 2800);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
    };
  }, []);

  // Effect to handle sequential answer display
  useEffect(() => {
    if (animationPhase === 'answers' && visibleAnswersCount < gameState.answers.length) {
      const timer = setTimeout(() => {
        setVisibleAnswersCount(prev => prev + 1);
      }, 200);

      return () => clearTimeout(timer);
    }
  }, [animationPhase, visibleAnswersCount, gameState.answers.length]);

  const handleContinue = () => {
    if (!socket) return;
    
    // Emit continue event to backend
    socket.emit('continue-from-answer-feedback', {
      gameId,
      answerId: gameState.answers.find(a => a.isCorrect)?.text || 'unknown'
    });
  };

  return (
    <PageLayout showHeader={true}>
      <main className="relative z-10 flex flex-col min-h-[calc(100vh-88px)] px-4">
        
        <MyPoints />

        {/* Main content centered */}
        <div className="flex flex-col items-center justify-center flex-1">
          
          {/* Main Message - appears first */}
          <div className={`mb-6 text-center transition-all duration-1000 ease-out transform ${
            animationPhase !== 'initial' ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-8 scale-90'
          }`}>
            {hasCorrectAnswer ? (
              <h1 className="mb-4 text-6xl font-bold leading-tight text-white drop-shadow-2xl animate-pulse">
                יפה מאוד
              </h1>
            ) : (
              <>
                <h1 className="mb-4 text-6xl font-bold leading-tight text-red-500 drop-shadow-2xl">
                  טעות
                </h1>
                <p className="text-xl font-semibold text-orange-400">
                  אבל מגיעות לך נקודות על ההשתדלות
                </p>
              </>
            )}
          </div>

          {/* Points Display with Stars - appears second */}
          <div className={`mb-8 flex items-center justify-center transition-all duration-1000 ease-out transform ${
            animationPhase === 'points' || animationPhase === 'answers' || animationPhase === 'complete' 
              ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-8 scale-75'
          }`}>
            {/* Left Star */}
            <div 
              className="w-[88px] h-[84px] mr-4 transition-all duration-700 ease-out"
              style={{ 
                transform: `scale(${starScale})`,
                animation: starScale > 0 ? 'bounce 0.5s ease-out' : 'none'
              }}
            >
              <img 
                src="/videos/star4.gif" 
                alt="star" 
                className="object-contain w-full h-full"
              />
            </div>
            
            {/* Points */}
            <div className={`flex items-center text-white font-normal transition-all duration-500 ${
              animationPhase === 'points' || animationPhase === 'answers' || animationPhase === 'complete' 
                ? 'animate-pulse' : ''
            }`}>
              <span className="text-[69px] leading-normal">+</span>
              <span className="text-[136px] leading-normal drop-shadow-2xl">
                {gameState.pointsReceived}
              </span>
            </div>
            
            {/* Right Star */}
            <div 
              className="w-[88px] h-[84px] ml-4 transition-all duration-700 ease-out"
              style={{ 
                transform: `scale(${starScale})`,
                animation: starScale > 0 ? 'bounce 0.5s ease-out 0.1s' : 'none'
              }}
            >
              <img 
                src="/videos/star4.gif" 
                alt="star" 
                className="object-contain w-full h-full"
              />
            </div>
          </div>

          {/* Question Text */}
          <div className={`mb-8 text-center max-w-md transition-all duration-1000 ease-out ${
            animationPhase === 'answers' || animationPhase === 'complete' 
              ? 'opacity-100' : 'opacity-0'
          }`}>
            <p className="text-white text-[21px] font-normal leading-normal drop-shadow-lg">
              {gameState.question}
            </p>
          </div>

          {/* Answers List - appears third */}
          <div className="w-full max-w-md">
            <div className="flex flex-col gap-[21px]">
              {gameState.answers.map((answer, index) => (
                <div
                  key={index}
                  className={`transition-opacity duration-300 ${
                    index < visibleAnswersCount ? 'opacity-100' : 'opacity-0'
                  }`}
                >
                  <OneAnswerFeedback
                    text={answer.text}
                    startAnimation={index<visibleAnswersCount}
                    isCorrect={answer.isCorrect}
                    howManyUsers={answer.howManyUsers}
                    totalUsers={totalUsers}
                    showAnswers={animationPhase === 'answers' || animationPhase === 'complete'}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Continue Button - appears last */}
          {showContinueButton && (
            <div className="flex justify-center w-full max-w-md mt-8">
              <Button
                variant="primary-large"
                onClick={handleContinue}
                trackingId="answer-feedback-continue"
                data-testid="continue-button"
              >
                {texts.answerFeedback.continueButton} {">>"}
              </Button>
            </div>
          )}
        </div>

        {/* Gaming-style background effects */}
        <div className="fixed inset-0 z-0 pointer-events-none">
          {hasCorrectAnswer && animationPhase !== 'initial' && (
            <>
              {/* Success sparkles */}
              <div className="absolute w-2 h-2 bg-yellow-400 rounded-full top-1/4 left-1/4 animate-ping" />
              <div className="absolute w-1 h-1 bg-green-400 rounded-full top-1/3 right-1/4 animate-ping" style={{ animationDelay: '0.5s' }} />
              <div className="absolute bottom-1/3 left-1/3 w-1.5 h-1.5 bg-blue-400 rounded-full animate-ping" style={{ animationDelay: '1s' }} />
              <div className="absolute w-1 h-1 bg-purple-400 rounded-full top-1/2 right-1/3 animate-ping" style={{ animationDelay: '1.5s' }} />
            </>
          )}
        </div>
      </main>
      
      <Footer />
    </PageLayout>
  );
}
