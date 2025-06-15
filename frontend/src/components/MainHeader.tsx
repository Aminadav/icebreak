import { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import TopMenu from './TopMenu';

interface IceBreakProps {}

function IceBreak({}: IceBreakProps): JSX.Element {
  return (
    <div className="relative w-full h-full">
      <div className="relative flex flex-row items-baseline justify-center w-full h-full gap-1 text-center text-white font-bubblegum" dir="ltr">
        <div className="relative shrink-0 text-[22px] whitespace-nowrap order-1">
          <p className="m-0 leading-normal">IceBreak!</p>
        </div>
        <div className="relative order-2 text-sm shrink-0 opacity-70">
          <p className="m-0 leading-normal">.cc</p>
        </div>
      </div>
    </div>
  );
}

interface MainHeaderProps {
  onMenuAction?: (action: string) => void;
}

export default function MainHeader({ onMenuAction }: MainHeaderProps): JSX.Element {
  const { texts } = useLanguage();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const isRTL = texts.direction === 'rtl';

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  return (
    <>
      <div className="bg-black sticky top-0 z-50 w-full h-[60px] flex items-center justify-between px-[13px] box-border">
        <button 
          className={`absolute ${isRTL ? 'left-[13px]' : 'right-[13px]'} top-1/2 -translate-y-1/2 w-6 h-6 bg-transparent border-none cursor-pointer p-0`}
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
        
        <button className={`absolute ${isRTL ? 'left-[60px]' : 'right-[60px]'} top-1/2 -translate-y-1/2 bg-transparent border-none cursor-pointer text-white text-xl opacity-80 p-0`}>
          <div className="w-[21.5px] h-[23px] flex items-center justify-center">→</div>
        </button>
        
        <div className={`absolute ${isRTL ? 'right-9' : 'left-9'} top-1/2 -translate-y-1/2 w-[80px]`}>
          <IceBreak />
        </div>
      </div>

      <TopMenu isOpen={isMenuOpen} onClose={closeMenu} onMenuAction={onMenuAction} />
    </>
  );
}
