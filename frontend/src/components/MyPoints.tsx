import { usePoints, useGame } from "../contexts/GameContext";
import { getBadgeImage } from "./BadgeSystem";
import GotBadgePage from "../pages/GotBadgePage";
import FullScreenModal from "./FullScreenModal";
import { useState } from "react";

export default function MyPoints(): JSX.Element {
  var { points } = usePoints();
  const { currentBadge } = useGame();
  const [isBadgeModalOpen, setIsBadgeModalOpen] = useState(false);

  const handleBadgeClick = () => {
    if (currentBadge) {
      setIsBadgeModalOpen(true);
    }
  };

  const handleModalClose = () => {
    setIsBadgeModalOpen(false);
  };

  return (
    <>
      <div className={`text-white end-5 align-middle top-5`} data-testid="my-points-display">
        <div className="flex flex-row-reverse items-center gap-5">
          <div className="flex items-center gap-1 border-b">
            <span className="font-bold text-white align-middle text-md" data-testid="my-points-value">
              {points}
            </span>
            <span className="text-sm font-medium text-white">
              נקודות
            </span>
          </div>
          {currentBadge && (
            <div className="flex flex-col items-center gap-1 cursor-pointer" onClick={handleBadgeClick}>
              <img
                src={getBadgeImage(currentBadge.id)}
                alt={currentBadge.name}
                className="w-6 h-6 rounded-full shadow-[3px_4px_4px_0px_rgba(0,0,0,0.41)] hover:scale-110 transition-transform duration-200"
              />
              <span className="text-sm font-medium">{currentBadge.name}</span>
            </div>
          )}
        </div>
      </div>

      <FullScreenModal 
        open={isBadgeModalOpen} 
        onRequestClose={handleModalClose}
      >
        <GotBadgePage 
          gameState={{ 
            screenName: 'GOT_BADGE',
            badgeId: currentBadge?.id || '',
            // friendsInLevel: []
          } as GAME_STATE_GOT_BADGE}
          isModal={true}
          onClose={handleModalClose}
        />
      </FullScreenModal>
    </>
  );
}
