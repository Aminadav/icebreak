import { useMemo } from "react";
import { env } from "../env";
import { Friend } from "./BadgeSystem";
import useStylesheet from "./useStylesheet";

interface OneFriendInYourLevelProps {
  friend: Friend;
  size: "medium" | "small" | 'large';
  animateIndex?:number
}
var _animateIndex=0

export default function Avatar({ friend,size }: OneFriendInYourLevelProps) {
  var animateIndex=useMemo(()=>_animateIndex++,[])
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

  var variants={
    'small':{
      pixels:45,
      showName:false
    },
    'medium':{
      pixels:60,
      showName:true
    },
    'large':{
      pixels:90,
      showName:true
    }
  }
  //@ts-ignore
  var thisVariant=variants[size]
  return (
    <div className="flex flex-col items-center gap-1">
      <div
        key={friend.user_id}
        style={{
          animationDelay: `${animateIndex * 0.1}s`,
        }}
        className="user-avatar"
      >
        <img
          alt={friend.name}
          className="object-cover border-2 border-white rounded-full shadow-lg"
          height={thisVariant.pixels}
          width={thisVariant.pixels}
          src={url}
          style={{ borderRadius: "50%" }}
        />
      </div>
      {thisVariant.showName && (
        <div
          className="font-normal text-[#ffffff] text-[11px] text-center overflow-hidden overflow-ellipsis text-nowrap"
          style={{ width: `${thisVariant.pixels}px` }}
        >
          {friend.name}
        </div>
      )}
    </div>
  )
}