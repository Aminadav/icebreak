import { Badge } from "../components/BadgeSystem";

interface ListOfLevelsToAchieveProps {
  badges: Badge[];
  userPoints: number;
}

export function BadgeListOfLevelsToAchieve({ badges, userPoints }: ListOfLevelsToAchieveProps) {
  return (
    <div className="flex flex-col items-center w-full gap-7">
      {badges.map((badge) => {
        const isAchieved = userPoints >= badge.pointsRequired;
        return (
          <OneLevelToAchieve
            key={badge.id}
            badge={badge}
            isAchieved={isAchieved}
          />
        );
      })}
    </div>
  );
}

var svgPaths={
pe89b200: "M1 7.89846L5.65646 12.7274L12.21 1",
}

interface OneLevelToAchieveProps {
  badge: Badge;
  isAchieved: boolean;
  isNext?: boolean;
}

export function OneLevelToAchieve({ badge, isAchieved, isNext = false }: OneLevelToAchieveProps) {
  const backgroundClass = isAchieved ? "bg-[#fae3ff]" : "bg-gray-100";
  const borderClass = isAchieved 
    ? "border border-[#925b03]" 
    : "border-4 border-gray-300";
  const textColor = isAchieved ? "text-black" : "text-gray-600";
  const numberOpacity = isAchieved ? "" : "opacity-50";
  const imageFilter = isAchieved 
    ? "drop-shadow(1px 2px 4px rgba(0, 0, 0, 0.25))" 
    : "grayscale(100%) drop-shadow(1px 2px 4px rgba(0, 0, 0, 0.25))";

  return (
    <div className={`
      flex items-center flex-row-reverse justify-between 
      h-32 w-[299px] p-4 
      rounded-lg shadow-md 
      ${backgroundClass} ${borderClass}
    `}>
      {/* Left section - Text content */}
      <div className="flex flex-col items-start flex-1 gap-4">
        <h3 className={`
          font-bold text-lg leading-tight text-right
          ${textColor}
        `}>
          {badge.name}
        </h3>
        <div className={`
          flex items-center gap-1 text-right opacity-75
          ${textColor}
        `}>
          <span className="text-xs">{badge.achieversCount}</span>
          <span className="text-sm">איש זכו בדרגה זו</span>
        </div>
      </div>

      {/* Center section - Badge image */}
      <div className="flex items-center justify-center mx-4">
        <div className="flex items-center justify-center w-20 h-20">
          <img
            src={badge.image}
            alt={badge.name}
            className="object-cover w-20 h-20 rounded-full shadow-lg"
            style={{ filter: imageFilter }}
          />
        </div>
      </div>

      {/* Right section - Badge number and checkmark */}
      <div className="flex flex-col items-center gap-2">
        <span className={`
          text-lg text-[#898888] font-normal
          ${numberOpacity}
        `}>
          {badge.id}
        </span>
        
        {isAchieved && (
          <div className="w-3 h-3">
            <svg
              className="w-full h-full"
              fill="none"
              viewBox="0 0 14 15"
            >
              <path
                d={svgPaths.pe89b200}
                stroke="#039902"
                strokeWidth="2"
              />
            </svg>
          </div>
        )}
      </div>
    </div>
  );
}