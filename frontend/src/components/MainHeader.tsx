import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { useSocket } from '../contexts/SocketContext';
import TopMenu from './TopMenu';
import { useGame } from '../contexts/GameContext';
import MyPoints from './MyPoints';
import { env } from '../env';

const DEBUG_SHOW_POINTS=true

interface IceBreakProps {
  onClick?: () => void;
}

function IceBreak({ onClick }: IceBreakProps): JSX.Element {
  return (
    <button 
      onClick={onClick}
      className="relative w-full h-full bg-transparent border-none cursor-pointer"
    >
      <div className="relative flex flex-row items-baseline justify-center w-full h-full gap-1 text-center text-white font-bubblegum" dir="ltr">
        <div className="relative shrink-0 text-[22px] whitespace-nowrap order-1">
          <p className="m-0 leading-normal">IceBreak!</p>
        </div>
        <div className="relative order-2 text-sm shrink-0 opacity-70">
          <p className="m-0 leading-normal">.cc</p>
        </div>
      </div>
    </button>
  );
}

interface MainHeaderProps {
  onMenuAction?: (action: string) => void;
  hidePoints?: boolean;
}

export default function MainHeader({ onMenuAction,hidePoints=false }: MainHeaderProps): JSX.Element {
  const { texts } = useLanguage();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const isRTL = texts.direction === 'rtl';
  var game= useGame()
  var {userData}=useSocket()
  var isInsideGame=!!game

  const handleLogoClick = () => {
    // Navigate to homepage using React Router
    navigate('/');
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  return (
    <>
      <div className="sticky top-0 z-50 w-full h-[60px] flex items-center justify-between px-[13px] box-border">
        <button 
          className={`absolute ${isRTL ? 'right-[9px]' : 'right-[9px]'} top-1/2 -translate-y-1/2 w-6 h-6 bg-transparent border-none cursor-pointer p-0`}
          onClick={toggleMenu}
        >
          <div className="w-[18px] h-3 mx-auto">
            <svg
              className="w-full h-full"
              fill="none"
              preserveAspectRatio="none"
              viewBox="0 0 18 12"
            >
              <path
                d="M0 12V10H18V12H0ZM0 7V5H18V7H0ZM0 2V0H18V2H0Z"
                fill="white"
              />
            </svg>
          </div>
        </button>
{/*         
        <button className={`absolute ${isRTL ? 'left-[9px]' : 'right-[9px]'} top-1/2 -translate-y-1/2 bg-transparent border-none cursor-pointer text-white text-xl opacity-80 p-0`}>
          <div className="w-[21.5px] h-[23px] flex items-center justify-center">→</div>
        </button>
         */}

        {isInsideGame && (userData?.name || DEBUG_SHOW_POINTS) && <div className={`absolute ${isRTL ? 'left-[9px]' : 'right-[9px]'} bg-transparent border-none text-white text-xl  p-0 top-[15px]`}>
          {(!hidePoints || DEBUG_SHOW_POINTS) && <MyPoints/>}
        </div>}

        <div
        onClick={handleLogoClick}
        style={{
          background:'url(/images/logos/ib-white.png?)',
          backgroundSize:'contain',
          backgroundRepeat:'no-repeat',
          backgroundPosition:'center',
          width:30,
          height:40,
          cursor: 'pointer'
        }}
        className={`absolute ${isRTL ? 'right-9' : 'left-9'} top-1/2 -translate-y-1/2 w-[80px]`}>
        </div>

        {env.is_dev && (
          <div className="absolute top-0 pt-1 text-xs text-white transform -translate-x-1/2 opacity-50 left-1/2">
            DEVELOPMENT MODE
          </div>
        )}
      </div>

      <TopMenu isOpen={isMenuOpen} onClose={closeMenu} onMenuAction={onMenuAction} />
    </>
  );
}
