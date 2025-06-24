import { usePoints, useGame } from "../contexts/GameContext";
import { getBadgeImage } from "./BadgeSystem";


export default function MyPoints(): JSX.Element {
  var {points}=usePoints();
  const { currentBadge } = useGame();
  
  return (
    <div className={`text-white absolute end-5 align-middle top-5`} data-testid="my-points-display">
      <div className="flex items-center gap-2">
        {currentBadge && (
          <div className="flex items-center gap-1">
            <img 
              src={getBadgeImage(currentBadge.id)} 
              alt={currentBadge.name}
              className="w-6 h-6 rounded-full"
            />
            <span className="text-sm font-medium">{currentBadge.name}</span>
          </div>
        )}
        <span className="text-lg font-bold text-white" data-testid="my-points-value">
        {points}
        </span>
        נקודות
      </div>
    </div>
  );
}
