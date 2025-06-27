import React, { useState } from 'react';
import PageLayout from '../components/PageLayout';
import Button from '../components/Button';
import AnimatedImage from '../components/AnimatedImage';
import { useGame } from '../contexts/GameContext';

interface ShareGamePageProps {
  onClose: () => void;
}

export default function ShareGamePage({ onClose }: ShareGamePageProps): JSX.Element {
  const { gameData } = useGame();
  const [copiedMessage, setCopiedMessage] = useState<number | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  // Generate game link
  const gameLink = `${window.location.origin}/game/${gameData?.gameId}/play`;

  // Pre-defined Hebrew messages
  var shareMessages = [
    "היי! יצרתי חידון מגניב שיגלה לכם דברים מפתיעים עליי 🎯 בואו תנחשו מה אתם יודעים עליי באמת!",
    "מוכנים לגלות כמה אתם באמת מכירים אותי? 🤔 יצרתי חידון אישי שיפתיע אתכם! בואו נראה מי יזכה 🏆",
    "חברים יקרים! יש לי אתגר בשבילכם 💪 יצרתי חידון על עצמי - מי שיענה הכי טוב יזכה בכבוד! בואו נשחק 🎮",
    "תאמינו? יצרתי חידון מטורף עליי 😄 יש שם שאלות שגם אני לא הייתי יודע לענות עליהן! בואו תנסו את המזל שלכם 🎲",
    "משעמם לכם? בואו נשחק במשחק חידון שיצרתי! 🎊 תגלו דברים חדשים עליי ותתחרו מי הכי מכיר אותי 🥇"
  ];

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(gameLink);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    } catch (err) {
      console.error('Failed to copy link:', err);
    }
  };

  const handleCopyMessage = async (index: number, message: string) => {
    try {
      const fullMessage = `${message}\n\n${gameLink}`;
      await navigator.clipboard.writeText(fullMessage);
      setCopiedMessage(index);
      setTimeout(() => setCopiedMessage(null), 2000);
    } catch (err) {
      console.error('Failed to copy message:', err);
    }
  };

  const handleShareMessage = async (message: string) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'בואו לשחק חידון!',
          text: message,
          url: gameLink
        });
      } catch (err) {
        console.error('Failed to share:', err);
      }
    } else {
      // Fallback to copy
      handleCopyMessage(0, message);
    }
  };

  return (
    <PageLayout>
      <main className="relative z-10 flex flex-col items-center justify-start min-h-screen px-6 pt-16">
        
        {/* Fun animated header */}
        <AnimatedImage src='/images/game-assets/share.png' size='large'>
        </AnimatedImage>

        {/* Title */}
        <div className="mb-8 text-center">
          <h1 className="mb-4 text-3xl font-bold leading-tight text-white drop-shadow-lg">
            בחרו הודעה לשיתוף
          </h1>
          <p className="text-lg text-white/80">
            או העתיקו את הקישור וכתבו הודעה משלכם
          </p>
        </div>

        {/* Game Link Section */}
        <div className="w-full max-w-md p-6 mb-8 border-2 border-blue-400 shadow-xl bg-black/80 backdrop-blur-md rounded-2xl">
          <h3 className="mb-4 text-xl font-semibold text-center text-white">קישור למשחק</h3>
          <div className="flex items-center gap-2 p-3 rounded-lg bg-white/10">
            <input
              type="text"
              dir='ltr'
              value={gameLink}
              readOnly
              onFocus={(e) => (e.target as HTMLInputElement).select()}
              onClick={(e) => (e.target as HTMLInputElement).select()}
              className="flex-1 px-3 py-2 text-sm text-white bg-transparent border-none outline-none cursor-pointer"
            />
            <Button
              variant={copiedLink ? "primary" : "primary"}
              onClick={handleCopyLink}
              className="px-4 py-2 text-sm"
            >
              {copiedLink ? "✓ הועתק!" : "העתק"}
            </Button>
          </div>
        </div>

        {/* Messages Section */}
        <div className="w-full max-w-2xl mb-8">
          <h3 className="mb-6 text-2xl font-semibold text-center text-white">הודעות מוכנות לשיתוף</h3>
          
          <div className="space-y-4">
            {shareMessages.map((message, index) => (
              <div
                key={index}
                className="p-6 transition-all duration-300 transform border-2 border-purple-400 shadow-lg bg-black/70 backdrop-blur-md rounded-2xl hover:scale-105 hover:shadow-xl animate-fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <p className="mb-2 text-lg leading-relaxed text-right text-white">
                  {message}
                </p>
                <p className="mb-4 text-sm text-blue-300 break-all" dir="ltr">
                  {gameLink}
                </p>
                
                <div className="flex justify-center gap-3">
                  <Button
                    variant={copiedMessage === index ? "primary" : "outline-purple"}
                    onClick={() => handleCopyMessage(index, message)}
                    className="px-4 py-2 text-sm"
                  >
                    {copiedMessage === index ? "✓ הועתק!" : "📋 העתק"}
                  </Button>
                  
                  <Button
                    variant="primary"
                    onClick={() => handleShareMessage(message)}
                    className="px-4 py-2 text-sm"
                  >
                    📤 שתף
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Close Button */}
        <div className="w-full max-w-md mb-8">
          <Button
            variant="secondary"
            onClick={onClose}
            className="w-full py-3 text-lg"
          >
            סגור
          </Button>
        </div>

        <style>{`
          @keyframes fade-in {
            from {
              opacity: 0;
              transform: translateY(20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          
          .animate-fade-in {
            animation: fade-in 0.6s ease-out forwards;
            opacity: 0;
          }
        `}</style>
      </main>
    </PageLayout>
  );
}
