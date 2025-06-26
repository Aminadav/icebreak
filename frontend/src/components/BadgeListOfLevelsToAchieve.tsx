import { useSocket } from "../contexts/SocketContext";
import { env } from "../env";
import Avatar from "./Avatar";
import { Badge, getBadgeImage } from "./BadgeSystem";

interface Friend {
  user_id: string;
  name: string;
  image: string;
}

interface ListOfLevelsToAchieveProps {
  badges: Badge[];
  friendsByBadge?: { [badgeId: string]: Friend[] };
}

export function BadgeListOfLevelsToAchieve({ badges, friendsByBadge }: ListOfLevelsToAchieveProps) {
  var currentUserId=useSocket().userData?.userId;
  return (
    <div className="flex flex-col items-center w-full gap-7">
      {badges.map((badge) => {
        const badgeFriends = friendsByBadge?.[badge.id] || [];
        const isAchieved = currentUserId ? badgeFriends.some(friend => friend.user_id === currentUserId) : false;
        
        return (
          <OneLevelToAchieve
            key={badge.id}
            badge={badge}
            isAchieved={isAchieved}
            badgeFriends={badgeFriends}
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
  badgeFriends: Friend[];
}

export function OneLevelToAchieve({ badge, isAchieved, badgeFriends }: OneLevelToAchieveProps) {
  const backgroundClass = isAchieved ? "bg-[#fae3ff]" : "bg-gray-100";
  const borderClass = isAchieved 
    ? "border border-[#925b03]" 
    : "border-4 border-gray-300";
  const textColor = isAchieved ? "text-black" : "text-gray-600";
  const numberOpacity = isAchieved ? "" : "opacity-50";
  const imageFilter = isAchieved 
    ? "drop-shadow(1px 2px 4px rgba(0, 0, 0, 0.25))" 
    : "grayscale(100%) drop-shadow(1px 2px 4px rgba(0, 0, 0, 0.25))";

  // Prepare users display
  var displayedUsers = badgeFriends.slice(0, 10);
  var remainingCount = badgeFriends.length - 10;
  // displayedUsers=[...displayedUsers,...displayedUsers]
  // displayedUsers=[...displayedUsers,...displayedUsers]
  // displayedUsers=[...displayedUsers,...displayedUsers]
  // displayedUsers=[...displayedUsers,...displayedUsers]
  // remainingCount=20
  return (
    <div className={`
      flex flex-col w-[299px] p-4 
      rounded-lg shadow-md 
      ${backgroundClass} ${borderClass}
    `}>
      {/* Top section - Badge info */}
      <div className="flex flex-row-reverse items-center justify-between mb-4">
        {/* Left section - Text content */}
        <div className="flex flex-col items-start flex-1 gap-2">
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
            <span className="text-xs">{badgeFriends.length}</span>
            <span className="text-sm">זכו בדרגה זו</span>
          </div>
          {/* Bottom section - User avatars */}
      {badgeFriends.length > 0 && (
        <div className="flex flex-wrap items-center justify-center gap-1">
        
          {displayedUsers.map((friend, index) => (
              <Avatar friend={friend} animateIndex={index} size="small" />
          ))}
          
          {remainingCount > 0 && (
            <div className={`
              flex items-center justify-center w-8 h-8 rounded-full 
              bg-gradient-to-br from-purple-500 to-purple-700 
              text-white text-xs font-bold shadow-lg
              user-avatar
              ${textColor}
            `}>
              +{remainingCount}
            </div>
          )}
        </div>
      )}
        </div>

        {/* Center section - Badge image */}
        <div className="flex items-center justify-center mx-4">
          <div 
            className="flex items-center justify-center w-21 h-21 rounded-full bg-[#EEE]"
            style={{ 
              filter: "drop-shadow(1px 2px 4px rgba(0, 0, 0, 0.25))",
              width: "84px",
              height: "84px"
            }}
          >
            <img
              src={`/images/badges/${badge.id}.png`}
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
      
    </div>
  );
}