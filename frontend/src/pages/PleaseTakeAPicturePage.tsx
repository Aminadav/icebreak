import React from 'react';
import PageLayout from '../components/PageLayout';
import Button from '../components/Button';
import MyPoints from '../components/MyPoints';
import Footer from '../components/Footer';
import TextWithParagraph from '../components/TextWithParagraph';
import { useLanguage } from '../contexts/LanguageContext';
import { useSocket } from '../contexts/SocketContext';
import { useGameId } from '../utils/useGameId';

export default function PleaseTakeAPicturePage(props: {gameState: gameStatePleaseTakeAPicture}): JSX.Element {
  const gameState = props.gameState;
  const { texts } = useLanguage();
  const { socket } = useSocket();
  const gameId = useGameId();

  const handleTakePhoto = () => {
    // TODO: Implement photo taking functionality
    console.log('Take photo clicked');
  };

  const handleGameWithoutPhotos = () => {
    // TODO: Implement game without photos functionality  
    console.log('Game without photos clicked');
  };

  return (
    <PageLayout showHeader={true}>
      <main className="relative z-10 flex flex-col min-h-[calc(100vh-88px)] px-4">
        
        {/* Main content centered */}
        <div className="flex flex-col items-center justify-center flex-1">
          
          {/* Main Title */}
          <div className="mb-8 text-center">
            <h1 className="text-5xl font-bold leading-tight text-white drop-shadow-2xl">
              {texts.pleaseTakeAPicture.title}
            </h1>
          </div>

          {/* Info Text Box */}
          <div className="w-full max-w-md mb-12">
            <div className="p-6 bg-blue-800 border border-blue-700 bg-opacity-80 rounded-2xl backdrop-blur-sm">
              <TextWithParagraph 
                text={texts.pleaseTakeAPicture.introText}
                className="text-lg leading-relaxed text-right text-white"
              />
            </div>
          </div>

          {/* Buttons */}
          <div className="flex flex-col items-center w-full max-w-md gap-6">
            <Button
              variant="primary-large"
              onClick={handleTakePhoto}
              /*trackingId="take-photo-button"*/
              trackingId="take-photo-button"
            >
              {texts.pleaseTakeAPicture.photoWithImageButton}
            </Button>

            <Button
              variant="secondary"
              onClick={handleGameWithoutPhotos}
              /*trackingId="game-without-photos-button"*/
              trackingId="game-without-photos-button"
            >
              {texts.pleaseTakeAPicture.gameWithoutPhotosButton}
            </Button>
          </div>
        </div>
      </main>
      
      <Footer />
    </PageLayout>
  );
}
