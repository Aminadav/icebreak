import { useSocket } from "../contexts/SocketContext";
import { env } from "../env";
import Avatar from "./Avatar";
import { Friend } from "./BadgeSystem";

interface ListOfFriendsInYourLevelProps {
  friends: Friend[];
}

export function BadgeListOfFriendsInYourLevel({ friends }: ListOfFriendsInYourLevelProps) {
  var userId=useSocket().userData?.userId;
  var friendsToShow=friends
      .filter((friend) => friend.user_id !== userId) // Exclude current user
  
  if (friendsToShow.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-6 text-center">
        <div className="mb-4 text-6xl text-white/80">🏆</div>
        <div className="mb-1 text-base font-medium text-white">
          אתם היחיד בדרגה הזו!
        </div>
        <div className="text-sm text-white/70">
          המשיכו לשחק כדי לעלות בדרגות!
        </div>
      </div>
    );
  }

  return (
    <div className="[flex-flow:wrap] box-border content-start flex gap-[9px] items-start justify-center p-0 relative w-full">
      {friendsToShow.map((friend) => (
        <div key={friend.user_id} className="relative shrink-0" data-name="image">
          <Avatar friend={friend} size="regular"/>
        </div>
      ))}
    </div>
  );
}