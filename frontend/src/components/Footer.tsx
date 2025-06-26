import { useGame } from "../contexts/GameContext";


interface FooterProps {
  className?: string;
}

/**
 * Showing the footer ONLY if there is a game, and the user answered at least 5 questions about themselves.
 */
export default function Footer({ className = '' }: FooterProps): JSX.Element {
  var gameData=useGame()
  // Do not show share footer if less that 5 questions users answered
  if((gameData?.gameData?.answeredQuestionsAboutThemself || 0)<5) return <div/>
  return (
    <div className={`fixed bottom-0 left-0 right-0 bg-black text-white text-center py-4 px-6 ${className}`}>
      <div className="flex items-center justify-between max-w-screen-xl mx-auto">
        {/* Left side - Game improvement button */}
        <button className="flex items-center px-4 py-2 text-orange-400 transition-colors duration-200 border border-orange-400 rounded-lg hover:bg-orange-400 hover:text-black">
          <span className="text-sm">שיתוף המשחק</span>
        </button>
        
        {/* Center - QR Code */}
        <div className="flex justify-center flex-1">
          <div className="flex items-center justify-center w-12 h-12 bg-white rounded">
            {/* QR Code placeholder - you can replace with actual QR code component */}
            <div className="grid w-8 h-8 grid-cols-3 gap-px bg-black">
              {Array.from({ length: 9 }).map((_, i) => (
                <div key={i} className={`w-full h-full ${i % 2 === 0 ? 'bg-white' : 'bg-black'}`} />
              ))}
            </div>
          </div>
        </div>
        
        {/* Right side - Text */}
        <div className="text-sm text-white">
          צרפו עוד חברים ויהיה אפילו יותר כיף
        </div>
      </div>
    </div>
  );
}
