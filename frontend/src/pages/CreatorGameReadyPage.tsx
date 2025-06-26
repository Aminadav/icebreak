import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PageLayout from '../components/PageLayout';
import Button from '../components/Button';
import AnimatedImage from '../components/AnimatedImage';
import ShareGameModal from '../components/ShareGameModal';
import { useSocket } from '../contexts/SocketContext';
import { useModal } from '../contexts/ModalContext';

import { useGameId } from '../utils/useGameId';
import { useGame } from '../contexts/GameContext';
import { env } from '../env';


export default function CreatorGameReadyPage(): JSX.Element {
  const { socket } = useSocket();
  const { openModal } = useModal();
  
  const {emitMoveToNextPage} = useGame();

  var gameId=useGameId()

  const handleStartGame = () => {
    emitMoveToNextPage();
  };

  const handleShareGame = () => {
    console.log('📤 Opening share game modal...');
    openModal(
      <ShareGameModal
        onStartPlay={() => {
          handleStartGame()
        }}
        onShareGame={() => {
          console.log('📤 Sharing game from modal...');
          // TODO: Implement actual sharing functionality
        }}
      />
    );
  };

  return (
    <PageLayout 
      showHeader={true} 
      
    >
      <main className="relative z-10 flex flex-col items-center justify-center min-h-[calc(100vh-88px)] px-4">
        
        {/* Celebration Image */}
        <div className="flex justify-center w-full mb-8">
          <AnimatedImage
            src="/images/icons/game_ready.png"
            alt="Game Ready Celebration"
            size="large"
            className="drop-shadow-2xl"
          />
        </div>

        {/* Title */}
        <div className="mb-6 text-center">
          <h1 className="mb-4 text-4xl font-bold text-white drop-shadow-lg">
            המשחק מוכן!
          </h1>
        </div>

        {/* Intro Text */}
        <div className="max-w-md mb-12 text-center">
          <p className="text-lg leading-relaxed text-white/90">
            מומלץ מאוד להתחיל לשחק, לפני השיתוף בקבוצה
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col items-center w-full max-w-md space-y-4">
          {/* Start Game - Main Button */}
          <Button
            variant="primary"
            onClick={handleStartGame}
            clickOnEnter={true}
            className="w-full px-8 py-4 text-xl"
            data-testid="creator-start-game-button"
          >
            התחל לשחק
          </Button>

          {/* Share Game - Ghost Button */}
          {env.SHOW_SHARE_BUTTON_WHEN_GAME_READY && <Button
            variant="ghost"
            onClick={handleShareGame}
            className="px-6 py-3"
          >
            שיתוף המשחק
          </Button>}
        </div>
      </main>
    </PageLayout>
  );
}
