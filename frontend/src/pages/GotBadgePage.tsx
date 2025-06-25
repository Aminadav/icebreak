import { useState, useEffect } from 'react';
import { usePoints, useGame } from '../contexts/GameContext';
import { useSocket } from '../contexts/SocketContext';
import { badges, getCurrentBadge, getNextBadge, getProgressToNextLevel, mockFriends, getBadgeImage } from '../components/BadgeSystem';
import { BadgeSectionHeader } from '../components/BadgeSectionHeader';
import { BadgeListOfFriendsInYourLevel } from '../components/BadgeListOfFriendsInYourLevel';
import { BadgeListOfLevelsToAchieve } from '../components/BadgeListOfLevelsToAchieve';
import { BadgeProgressBar } from '../components/BadgeProgressBar';
import { useOnEnter } from '../hooks/useOnEnter';
import { useDocumentOnClick } from '../hooks/useDocumentOnClick';

interface Friend {
  user_id: string;
  name: string;
  image: string;
}

interface BadgeSystemFriend {
  user_id: string;
  name: string;
  image: string;
}

export default function GotBadgePage(props: {gameState: GAME_STATE_GOT_BADGE, isModal?: boolean, onClose?: () => void}): JSX.Element {
  var myPoints=usePoints().points
  const { emitMoveToNextPage, gameId } = useGame();
  const { socket } = useSocket();
  
  // User's current points - can be changed to test different levels
  const [userPoints] = useState(myPoints);
  
  // Badge data from backend
  const [badgeData, setBadgeData] = useState<{
    gameId: string;
    friendsByBadge: { [badgeId: string]: Friend[] }
  } | null>(null);
  
  // Emit event to get badge data when component mounts
  useEffect(() => {
    if (socket && gameId) {
      console.log('Requesting badge data for game:', gameId);
      socket.emit('get-data-for-badge-page', { gameId });
    }
  }, [socket, gameId]);
  
  // Listen for badge data updates
  useEffect(() => {
    if (!socket) return;
    
    const handleBadgeUpdate = (data: { gameId: string; friendsByBadge: { [badgeId: string]: Friend[] } }) => {
      console.log('Received badge data:', data);
      
      // Only update if this event is for the current game
      if (data.gameId === gameId) {
        setBadgeData(data);
      } else {
        console.log('Ignoring badge update for different game:', data.gameId, 'current:', gameId);
      }
    };
    
    socket.on('game-badges-update', handleBadgeUpdate);
    
    return () => {
      socket.off('game-badges-update', handleBadgeUpdate);
    };
  }, [socket, gameId]);
  
  const currentBadge = getCurrentBadge(userPoints);
  const nextBadge = getNextBadge(userPoints);
  const progress = getProgressToNextLevel(userPoints);
  var {userData}=useSocket()


  // Get friends for current badge level
  const currentBadgeFriends = badgeData?.friendsByBadge?.[currentBadge?.id || ''] 
    ? badgeData.friendsByBadge[currentBadge?.id || '']
    .filter(item=>item.user_id!=userData?.user_id)
    : []

  const handleContinue = () => {
    if (props.isModal && props.onClose) {
      console.log('Badge modal continue clicked - closing modal');
      props.onClose();
    } else {
      console.log('Badge page continue clicked - moving to next screen');
      emitMoveToNextPage();
    }
  };

  // If no current badge, shouldn't happen, but handle gracefully
  if (!currentBadge) {
    return <div>Loading...</div>;
  }

  useOnEnter(handleContinue);
  useDocumentOnClick(handleContinue); // Enable document click for both modal and normal mode

  return (
    <div
      className="relative w-full min-h-screen bg-center bg-no-repeat bg-cover"
    >
      {/* Gaming Animation Styles */}
      <style>{`
        @keyframes badgeBounce {
          0%, 100% { transform: translateY(0px) scale(1); }
          50% { transform: translateY(-10px) scale(1.05); }
        }
        
        @keyframes badgeGlow {
          0% { filter: brightness(1) drop-shadow(0 0 20px rgba(255, 215, 0, 0.5)); }
          100% { filter: brightness(1.2) drop-shadow(0 0 40px rgba(255, 215, 0, 0.8)); }
        }
        
        @keyframes badgeRotate {
          0% { transform: rotate(0deg); }
          70% { transform: rotate(360deg); }
          100% { transform: rotate(360deg); }
        }
        
        @keyframes badgeScale {
          0% { transform: scale(1); }
          50% { transform: scale(1.5); }
          100% { transform: scale(1); }
        }
        
        @keyframes sparkle-0 {
          0%, 100% { opacity: 0; transform: scale(0) rotate(0deg); }
          50% { opacity: 1; transform: scale(1) rotate(180deg); }
        }
        
        @keyframes sparkle-1 {
          0%, 100% { opacity: 0; transform: scale(0) rotate(45deg); }
          50% { opacity: 1; transform: scale(1.2) rotate(225deg); }
        }
        
        @keyframes sparkle-2 {
          0%, 100% { opacity: 0; transform: scale(0) rotate(90deg); }
          50% { opacity: 1; transform: scale(0.8) rotate(270deg); }
        }
        
        @keyframes sparkle-3 {
          0%, 100% { opacity: 0; transform: scale(0) rotate(135deg); }
          50% { opacity: 1; transform: scale(1.1) rotate(315deg); }
        }
        
        @keyframes sparkle-4 {
          0%, 100% { opacity: 0; transform: scale(0) rotate(180deg); }
          50% { opacity: 1; transform: scale(0.9) rotate(360deg); }
        }
        
        @keyframes sparkle-5 {
          0%, 100% { opacity: 0; transform: scale(0) rotate(225deg); }
          50% { opacity: 1; transform: scale(1.3) rotate(405deg); }
        }
        
        @keyframes sparkle-6 {
          0%, 100% { opacity: 0; transform: scale(0) rotate(270deg); }
          50% { opacity: 1; transform: scale(0.7) rotate(450deg); }
        }
        
        @keyframes sparkle-7 {
          0%, 100% { opacity: 0; transform: scale(0) rotate(315deg); }
          50% { opacity: 1; transform: scale(1.1) rotate(495deg); }
        }
      `}</style>
      
      <div className="relative w-full">
        {/* Header Section */}
        <div className="relative w-full">
          <div className="bg-[#41115e] relative w-full">
            {/* Top Badge Image */}
            <div
              className="bg-center bg-cover bg-no-repeat relative w-full h-[278px]"
              style={{ backgroundImage: `url('${'/images/game-assets/got-badge-top.png'}')` }}
            />
            
            {/* Purple overlay with rounded top */}
            <div className="bg-[#41115e] relative w-full rounded-tl-[30px] rounded-tr-[30px] -mt-[20px] pt-[40px]">
              
              {/* Congratulations text */}
              <div className=" font-normal leading-[0] not-italic text-[#ffffff] text-[32px] text-center px-[45px] pb-[20px]">
                <p className="block leading-[normal]" dir="auto">
                  {props.isModal ? 'הדרגה שלך' : 'כל הכבוד! עלית בדרגה!'}
                </p>
              </div>

              {/* Current Level Section */}
              <div className="relative px-[45px] pb-[40px]">
                {/* Current Badge Display */}
                <div className="flex items-center justify-center relative w-full mb-[20px]">
                  <div className="relative">
                    {/* Sparkle particles */}
                    <div className="absolute inset-0 pointer-events-none">
                      {[...Array(8)].map((_, i) => (
                        <div
                          key={i}
                          className="absolute w-2 h-2 bg-yellow-300 rounded-full opacity-80"
                          style={{
                            top: `${20 + Math.sin(i * Math.PI / 4) * 80}px`,
                            left: `${85 + Math.cos(i * Math.PI / 4) * 80}px`,
                            animation: `sparkle-${i} 2s infinite ease-in-out`,
                            animationDelay: `${i * 0.2}s`
                          }}
                        />
                      ))}
                    </div>
                    
                    <div 
                      className="relative w-[170px] h-[170px]"
                      style={{
                        animation: 'badgeBounce 3s infinite ease-in-out, badgeGlow 2s infinite alternate ease-in-out, badgeScale 1s ease-in-out 3s forwards'
                      }}
                    >
                      <img
                        alt={currentBadge.name}
                        className="block max-w-none size-full"
                        src={getBadgeImage(currentBadge.id)}
                        style={{
                          borderRadius: '170.099px',
                          border: '2px solid #FFD700',
                          background: `url('${getBadgeImage(currentBadge.id)}') lightgray 50% / cover no-repeat`,
                          boxShadow: '0px 0px 22px 10px rgba(255, 215, 0, 0.8), 0px 0px 44px 20px rgba(255, 255, 255, 0.4)',
                          animation: 'badgeRotate 3s linear forwards'
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* Current Level Name */}
                <div className=" font-normal leading-[0] not-italic text-[#ffffff] text-[32px] text-center mb-[20px]">
                  <p className="block leading-[normal]" dir="auto">
                    {currentBadge.name}
                  </p>
                </div>

                {/* Description */}
                <div className=" font-normal leading-[30px] not-italic text-[#ffffff] text-[20px] text-center tracking-[0.2px] mb-[30px]">
                  <p className="block" dir="auto">
                    עבודה מצויינת! תמשיכו לשחק!
                    <br />
                    זה מגבש את הקבוצה, ועושה טוב לאנושות.
                  </p>
                </div>
              </div>

              {/* Next Level Section */}
              <div className="relative w-full mb-[20px]">
                <BadgeSectionHeader title="הדרגה הבאה" />
              </div>

              {nextBadge ? (
                <div className="px-[45px] pb-[40px] text-center">
                  {/* Next Level Badge and Info */}
                  <div className="text-center inline-flex items-center relative mb-[20px]">
                    <div className="w-[82px] h-[82px] mr-[20px]">
                      <img
                        alt={nextBadge.name}
                        className="block max-w-none size-full"
                        src={getBadgeImage(nextBadge.id)}
                        /**border-radius: 82px;
background: url(<path-to-image>) lightgray 50% / cover no-repeat; */
                        style={{
                          borderRadius: '82px',
                          filter: 'grayscale(100%)'
                        }}
                      />
                    </div>
                    <div style={{width:20}}/>
                    <div className="flex-1 text-right">
                      <div className=" font-normal leading-[0] not-italic text-[#ffffff] text-[26px] text-right">
                        <p className="block leading-[normal]" dir="auto">
                          {nextBadge.name}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Points Info */}
                  <div className=" font-normal leading-[28px] not-italic text-[#ffffff] text-[19px] text-center mb-[20px]">
                    <p className="block" dir="auto">
                      <span>על מנת להגיע לדרגת </span>
                      <span className="not-italic font-bold ">
                        {nextBadge.name}
                      </span>
                      <span> עליכם לקבל {nextBadge.pointsRequired} נקודות</span>
                    </p>
                  </div>

                  <div className=" font-normal leading-[25px] not-italic text-[#ffffff] text-[15px] text-center mb-[20px]">
                    <p className="block mb-0" dir="auto">
                      <span>יש לכם </span>
                      <span className="not-italic font-bold ">
                        {progress.current}
                      </span>
                      <span> נקודות</span>
                    </p>
                    <p className="block" dir="auto">
                      <span>נשארו לכם רק עוד </span>
                      <span className="not-italic font-bold ">
                        {progress.needed}
                      </span>
                      <span> למעבר לדרגה הבאה</span>
                    </p>
                  </div>

                  {/* Animated Progress Bar */}
                  <div className="px-[6px] mb-[40px]">
                    <BadgeProgressBar percentage={Math.max(progress.percentage,10)} animated={true} />
                  </div>
                  {JSON.stringify(Math.max(progress.percentage,10))}
                </div>
              ) : (
                <div className="px-[45px] pb-[40px]">
                  <div className=" font-normal leading-[28px] not-italic text-[#ffffff] text-[19px] text-center">
                    <p className="block" dir="auto">
                      מזל טוב! השגתם את הדרגה הגבוהה ביותר!
                    </p>
                  </div>
                </div>
              )}

              {/* Friends in Your Level Section */}
              <div className="relative w-full mb-[20px]">
                <BadgeSectionHeader title="חברים בדרגה שלכם" />
              </div>

              <div className="px-[27px] pb-[40px]">
                <BadgeListOfFriendsInYourLevel 
                  friends={currentBadgeFriends} 
                />
              </div>

              {/* List of Levels Section */}
              <div className="relative w-full mb-[20px]">
                <BadgeSectionHeader title="רשימת הדרגות" />
              </div>

              <div className="px-[60px] pb-[40px]">
                <BadgeListOfLevelsToAchieve 
                badges={badges}
                friendsByBadge={badgeData?.friendsByBadge}
                />
              </div>

              {/* Bottom Message */}
              <div className=" font-normal leading-[0] not-italic text-[#ffffff] text-[23px] text-center px-[60px] pb-[40px]">
                <p className="block leading-[normal]" dir="auto">
                  כל עליה שלכם בדרגה משקפת שינוי גדול שאתם יוצרים בעולם.
                </p>
              </div>

              {/* Continue Button */}
              <div className="px-[45px] pb-[60px]">
                <button
                  onClick={handleContinue}
                  className="w-full px-8 py-4 text-xl font-bold text-purple-900 transition-all duration-300 transform rounded-full shadow-lg bg-gradient-to-r from-yellow-400 to-yellow-600 hover:from-yellow-500 hover:to-yellow-700 hover:scale-105"
                >
                  המשך
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}