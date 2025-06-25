import { env } from "../env";
import { Friend } from "./BadgeSystem";
import useStylesheet from "./useStylesheet";

interface OneFriendInYourLevelProps {
  friend: Friend;
  size?: "regular" | "small" ;
  animateIndex?:number
}

export default function Avatar({ friend, size = "regular",animateIndex=0 }: OneFriendInYourLevelProps) {
  useStylesheet('AvatarStyling',`
            @keyframes float {
              0%, 100% { transform: translateY(0px); }
              50% { transform: translateY(-2px); }
            }
            .user-avatar {
              animation: float 3s ease-in-out infinite;
              transition: transform 0.2s ease-in-out;
            }
            
            .user-avatar:hover {
              transform: scale(1.2) translateY(-4px);
              z-index: 10;
            }
            
            .user-avatar {
              animation: float 3s ease-in-out infinite, glow 2s ease-in-out infinite;
            }
          `)

  let url = `${env.BACKEND_URL}/uploads/${friend.image}.jpg`
  return (
    <div>
      {size === "small" &&(
        
          <div
              key={friend.user_id}
              style={{
                animationDelay: `${animateIndex * 0.1}s`,
                border:'50%'
              }}
              className="user-avatar"
            >
              <img
                alt={friend.name}
                className="object-cover w-16 h-16 border-2 border-white rounded-full shadow-lg"
                height="59.99999237060547"
                src={url}
                width="59.99999237060547"
                style={{ borderRadius: "50%" }}
              />
              </div>
            
)}

      {size == "regular" &&
        <div className="relative size-full" data-name="Property 1=רגיל">
          <div className="box-border content-stretch flex flex-col gap-2.5 items-center justify-start p-0 relative size-full w-[60px] h-[60px]">
            <div className="rounded-full relative shrink-0 size-[60px]" data-name="image">
              <img
                alt={friend.name}
                className="object-cover border-2 border-white rounded-full shadow-lg"
                height="60px"
                src={url}
                width="60px"
                style={{ borderRadius: "50%" }}
              />
            </div>
            <div
              className="font-normal shrink-0 text-[#ffffff] text-[11px] text-center w-[60px] overflow-hidden overflow-ellipsis text-nowrap"
            >
                {friend.name}-{friend.name}-{friend.name}
            </div>
          </div>
        </div>
      }
    </div>
  )
}