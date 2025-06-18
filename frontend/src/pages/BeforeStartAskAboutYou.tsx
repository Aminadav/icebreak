import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PageLayout from '../components/PageLayout';
import Button from '../components/Button';
import AnimatedImage from '../components/AnimatedImage';
import MyPoints from '../components/MyPoints';
import { useSocket } from '../contexts/SocketContext';
import { useGameId } from '../utils/useGameId';
import { usePoints } from '../contexts/GameContext';

export default function BeforeStartAskAboutYou(props:{gameState:GAME_STATES}): JSX.Element {
  const navigate = useNavigate();
  const gameId = useGameId();
  const { points } = usePoints();
  const {socket} = useSocket();

  const handleStartQuestions = () => {
    socket.emit('start-about-me')
  };

  return (
    <PageLayout 
      showHeader={true} 
    >
      <main className="relative z-10 flex flex-col min-h-[calc(100vh-88px)] px-4">
        
        <MyPoints points={points} />

        {/* Main content centered */}
        <div className="flex flex-col items-center justify-center flex-1">
          
          {/* Main Image */}
          <div className="flex justify-center w-full mb-4">
            <AnimatedImage
              src="/images/game-assets/i_have_question.png"
              alt="יש לי שאלה"
              size="large"
              className="drop-shadow-2xl"
            />
          </div>

          {/* Main Text */}
          <div className="mb-12 text-center">
            <h1 className="text-3xl font-bold leading-relaxed text-white drop-shadow-lg">
              לפני שנתחיל עם החידון נשאל אותך 5 שאלות להיכרות
            </h1>
          </div>

          {/* Main Button */}
          <div className="flex justify-center w-full max-w-md">
            <Button
              variant="primary"
              onClick={handleStartQuestions}
              className="w-full px-8 py-4 text-xl"
            >
              יאללה, לשאלות &gt;&gt;
            </Button>
          </div>
        </div>
      </main>
    </PageLayout>
  );
}
