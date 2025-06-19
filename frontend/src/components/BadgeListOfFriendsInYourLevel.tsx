import { Friend } from "./BadgeSystem";

interface ListOfFriendsInYourLevelProps {
  friends: Friend[];
}

export function BadgeListOfFriendsInYourLevel({ friends }: ListOfFriendsInYourLevelProps) {
  return (
    <div className="[flex-flow:wrap] box-border content-start flex gap-[9px] items-start justify-center p-0 relative w-full">
      {friends.map((friend) => (
        <div key={friend.userId} className="relative shrink-0" data-name="image">
          <OneFriendInYourLevel friend={friend} />
        </div>
      ))}
    </div>
  );
}


interface OneFriendInYourLevelProps {
  friend: Friend;
  size?: "regular" | "small";
}

export function OneFriendInYourLevel({ friend, size = "regular" }: OneFriendInYourLevelProps) {
  if (size === "small") {
    return (
      <div className="relative size-full" data-name="Property 1=small_no_name">
        <div className="box-border content-stretch flex flex-col gap-2.5 items-center justify-start p-0 relative size-full">
          <div
            className="absolute aspect-[50/50] left-0 right-0 top-1/2 translate-y-[-50%] rounded-full"
            data-name="image"
          >
            <img
              className="block rounded-full max-w-none size-full"
              height="30"
              src={friend.image}
              width="30"
              style={{borderRadius:'50%'}}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative size-full" data-name="Property 1=רגיל">
      <div className="box-border content-stretch flex flex-col gap-2.5 items-center justify-start p-0 relative size-full">
        <div className="rounded-full relative shrink-0 size-[60px]" data-name="image">
          <img
            alt={friend.name}
            className="block max-w-none size-full"
            height="59.99999237060547"
            src={friend.image}
            width="59.99999237060547"
            style={{ borderRadius: "50%" }}
          />
        </div>
        <div
          className="-webkit-box css-ywbagn  font-normal leading-[0] min-w-full not-italic overflow-ellipsis overflow-hidden relative shrink-0 text-[#ffffff] text-[11px] text-center"
          style={{ width: "min-content" }}
        >
          <p className="block leading-[normal]" dir="rtl">
            {friend.name}
          </p>
        </div>
      </div>
    </div>
  );
}