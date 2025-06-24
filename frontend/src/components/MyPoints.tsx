import { usePoints, useGame } from "../contexts/GameContext";
import { getBadgeImage } from "./BadgeSystem";

export default function MyPoints(): JSX.Element {
  var { points } = usePoints();
  const { currentBadge } = useGame();

  return (
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
          <div className="flex flex-col items-center gap-1">
            <img
              src={getBadgeImage(currentBadge.id)}
              alt={currentBadge.name}
              className="w-6 h-6 rounded-full shadow-[3px_4px_4px_0px_rgba(0,0,0,0.41)]"
            />
            <span className="text-sm font-medium">{currentBadge.name}</span>
          </div>
        )}
      </div>
    </div>
  );
}
