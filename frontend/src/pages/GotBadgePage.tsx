import { useState, useEffect } from 'react';
import { usePoints } from '../contexts/GameContext';
import { badges, getCurrentBadge, getNextBadge, getProgressToNextLevel, mockFriends } from '../components/BadgeSystem';
import { BadgeSectionHeader } from '../components/BadgeSectionHeader';
import { BadgeListOfFriendsInYourLevel } from '../components/BadgeListOfFriendsInYourLevel';
import { BadgeListOfLevelsToAchieve } from '../components/BadgeListOfLevelsToAchieve';
import { BadgeProgressBar } from '../components/BadgeProgressBar';

// Badge types array based on the Figma design
// const badges = [
//   { name: 'מתחמם', image: '/images/badges/badge-sample.webp', pointsToAchieve:10 },
//   { name: 'שובר קרחים', image: '/images/badges/badge-sample.webp', pointsToAchieve:20 },
//   { name: 'פותח השיחות', image: '/images/badges/badge-sample.webp', pointsToAchieve:30 },
//   { name: 'השראה מהלכת', image: '/images/badges/badge-sample.webp', pointsToAchieve:40 },
//   { name: 'מגדלור אנושי', image: '/images/badges/badge-sample.webp', pointsToAchieve:50 },
//   { name: 'נוגע בלבבות', image: '/images/badges/badge-sample.webp', pointsToAchieve:60 },
//   { name: 'מעמיק הקשרים', image: '/images/badges/badge-sample.webp', pointsToAchieve:70 },
//   { name: 'מרים המסיבות', image: '/images/badges/badge-sample.webp', pointsToAchieve:80 },
//   { name: 'מקהיל קהילות', image: '/images/badges/badge-sample.webp', pointsToAchieve:90 },
//   { name: 'מאחד הלבבות', image: '/images/badges/badge-sample.webp', pointsToAchieve:100 }
// ];

interface Friend {
  user_id: string;
  name: string;
  image: string;
}

export default function GotBadgePage(props: {gameState: GAME_STATE_GOT_BADGE}): JSX.Element {
  var myPoints=usePoints().points
   // User's current points - can be changed to test different levels
  const [userPoints] = useState(382);
  
  const currentBadge = getCurrentBadge(userPoints);
  const nextBadge = getNextBadge(userPoints);
  const progress = getProgressToNextLevel(userPoints);

  return (
    <div
      className="relative w-full min-h-screen bg-center bg-no-repeat bg-cover"
    >
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
                  כל הכבוד! עלית בדרגה!
                </p>
              </div>

              {/* Current Level Section */}
              <div className="relative px-[45px] pb-[40px]">
                {/* Current Badge Display */}
                <div className="flex items-center justify-center relative w-full mb-[20px]">
                  <div className="relative">
                    <div className="relative w-[170px] h-[170px]">
                      <img
                        alt={currentBadge.name}
                        className="block max-w-none size-full"
                        src={currentBadge.image}
                        style={{
                          borderRadius: '170.099px',
                          border: '2px solid #FFD700',
                          background: `url('${currentBadge.image}') lightgray 50% / cover no-repeat`,
                          boxShadow: '0px 0px 22px 10px rgba(255, 255, 255, 0.60)'
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
                        src={nextBadge.image}
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
                      <span className="font-['Inter:Bold',_sans-serif] font-bold not-italic">
                        {nextBadge.name}
                      </span>
                      <span> עליכם לקבל {nextBadge.pointsRequired} נקודות</span>
                    </p>
                  </div>

                  <div className=" font-normal leading-[25px] not-italic text-[#ffffff] text-[15px] text-center mb-[20px]">
                    <p className="block mb-0" dir="auto">
                      <span>יש לכם </span>
                      <span className="font-['Inter:Bold',_sans-serif] font-bold not-italic">
                        {progress.current}
                      </span>
                      <span> נקודות</span>
                    </p>
                    <p className="block" dir="auto">
                      <span>נשארו לכם רק עוד </span>
                      <span className="font-['Inter:Bold',_sans-serif] font-bold not-italic">
                        {progress.needed}
                      </span>
                      <span> למעבר לדרגה הבאה</span>
                    </p>
                  </div>

                  {/* Animated Progress Bar */}
                  <div className="px-[6px] mb-[40px]">
                    <BadgeProgressBar percentage={progress.percentage} animated={true} />
                  </div>
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
                <BadgeListOfFriendsInYourLevel friends={mockFriends} />
              </div>

              {/* List of Levels Section */}
              <div className="relative w-full mb-[20px]">
                <BadgeSectionHeader title="רשימת הדרגות" />
              </div>

              <div className="px-[60px] pb-[40px]">
                <BadgeListOfLevelsToAchieve badges={badges} userPoints={userPoints} />
              </div>

              {/* Bottom Message */}
              <div className=" font-normal leading-[0] not-italic text-[#ffffff] text-[23px] text-center px-[60px] pb-[40px]">
                <p className="block leading-[normal]" dir="auto">
                  כל עליה שלכם בדרגה משקפת שינוי גדול שאתם יוצרים בעולם.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}