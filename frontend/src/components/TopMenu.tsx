import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useTracking } from '../contexts/TrackingContext';

interface TopMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onMenuAction?: (action: string) => void;
}

export default function TopMenu({ isOpen, onClose, onMenuAction }: TopMenuProps): JSX.Element {
  const { texts, language, toggleLanguage } = useLanguage();
  const { trackEvent } = useTracking();
  const isRTL = texts.direction === 'rtl';

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const menuItems = [
    { text: texts.menu.greeting, icon: '👋', hasGreeting: true, gradient: 'from-yellow-400 to-orange-500', isEmoji: true },
    { text: texts.menu.mute, icon: '/images/icons/mute.svg', gradient: 'from-purple-400 to-purple-600' },
    { text: texts.menu.shareGame, icon: '/images/icons/share.svg', gradient: 'from-blue-400 to-blue-600' },
    { text: texts.menu.champions, icon: '/images/icons/champions.svg', gradient: 'from-yellow-500 to-yellow-700' },
    { text: texts.menu.dashboard, icon: '/images/icons/dashboard.svg', gradient: 'from-green-400 to-green-600' },
    { text: texts.menu.myGames, icon: '/images/icons/my_games.svg', gradient: 'from-pink-400 to-pink-600' },
    { text: texts.menu.createGame, icon: '/images/icons/icons/plus.svg', gradient: 'from-emerald-400 to-emerald-600' },
    { text: texts.menu.components, icon: '🎨', gradient: 'from-indigo-400 to-pink-500', isEmoji: true },
    { text: texts.menu.help, icon: '/images/icons/whatsapp.svg', gradient: 'from-cyan-400 to-cyan-600', link: 'https://chat.whatsapp.com/GbDiSa5pMNsLWgnTlDjXm5' },
    { text: texts.menu.about, icon: '/images/icons/about.svg', gradient: 'from-indigo-400 to-indigo-600' },
    { text: texts.menu.updates, icon: '/images/icons/whatsapp.svg', gradient: 'from-red-400 to-red-600', link: 'https://chat.whatsapp.com/GzczSiemSHxEKOMIkrxBOb' },
    { text: texts.menu.logout, icon: '/images/icons/logout.svg', gradient: 'from-gray-400 to-gray-600' }
  ];

  return (
    <>
      {/* Overlay */}
      <div
        className={`fixed inset-0 bg-black bg-opacity-50 transition-opacity duration-300 z-40 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={handleOverlayClick}
      />
      
      {/* Menu */}
      <div
        className={`fixed top-[60px] ${isRTL ? 'left-0' : 'right-0'} w-[300px] bg-gradient-to-br from-indigo-50 via-white to-purple-50 shadow-2xl z-50 transform transition-transform duration-300 ease-out border-l-4 border-gradient-to-b from-blue-400 to-purple-500 ${
          isOpen 
            ? 'translate-x-0' 
            : isRTL 
              ? '-translate-x-full' 
              : 'translate-x-full'
        }`}
        style={{
          maxHeight: 'calc(100vh - 60px)',
          overflowY: 'auto',
          borderImage: 'linear-gradient(45deg, #3b82f6, #8b5cf6) 1'
        }}
      >
        <div className="p-5">
          {/* Fun Header */}
          <div className="text-center mb-6">
            <div className="text-2xl mb-2">🎮</div>
            <div className="text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              {texts.menu.title}
            </div>
          </div>

          {/* Language Toggle Button */}
          <div className={`flex ${isRTL ? 'justify-start' : 'justify-end'} mb-6`}>
            <button
              onClick={() => {
                trackEvent('language_toggle_clicked', {
                  current_language: language,
                  new_language: language === 'he' ? 'en' : 'he'
                });
                toggleLanguage();
              }}
              className="group flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-lg shadow-md"
            >
              <span className="text-lg group-hover:scale-110 transition-transform duration-200">
                {language === 'he' ? '🇺🇸' : '🇮🇱'}
              </span>
              <span className="text-sm font-medium">
                {language === 'he' ? texts.common.switchToEnglish : texts.common.switchToHebrew}
              </span>
            </button>
          </div>

          {/* Menu Items */}
          <div className="space-y-3">
            {menuItems.map((item, index) => (
              <button
                key={index}
                className={`group w-full relative overflow-hidden rounded-xl transition-all duration-300 transform hover:scale-102 hover:shadow-xl shadow-md ${
                  item.hasGreeting 
                    ? 'mb-4 border-2 border-dashed border-yellow-300 bg-gradient-to-r from-yellow-100 to-orange-100' 
                    : 'hover:-translate-y-1'
                }`}
                onClick={() => {
                  // Track menu item click
                  const menuItemKey = item.text.toLowerCase().replace(/\s+/g, '_');
                  trackEvent('menu_item_clicked', {
                    menu_item: menuItemKey,
                    has_link: !!item.link,
                    text: item.text
                  });
                  
                  // Handle menu item click
                  console.log(`Clicked: ${item.text}`);
                  
                  // If item has a link (WhatsApp groups), open it
                  if (item.link) {
                    window.open(item.link, '_blank');
                  } else {
                    // Handle specific menu actions
                    if (item.text === texts.menu.about && onMenuAction) {
                      onMenuAction('about');
                    } else if (item.text === texts.menu.components && onMenuAction) {
                      onMenuAction('components');
                    } else {
                      // Handle other menu actions here
                      // TODO: Add specific handlers for each menu item
                    }
                  }
                  
                  onClose();
                }}
              >
                {/* Gradient Background */}
                <div className={`absolute inset-0 bg-gradient-to-r ${item.gradient} opacity-90 group-hover:opacity-100 transition-opacity duration-300`} />
                
                {/* Content */}
                <div className={`relative flex items-center gap-4 px-5 py-4 ${
                  isRTL ? 'text-right' : 'text-left'
                }`}>
                  {/* Icon with animation */}
                  <div className="text-2xl flex-shrink-0 group-hover:scale-125 group-hover:rotate-12 transition-transform duration-300 filter drop-shadow-lg">
                    {item.isEmoji ? (
                      <span>{item.icon}</span>
                    ) : (
                      <img 
                        src={item.icon} 
                        alt={item.text}
                        className="w-6 h-6 filter brightness-0 invert"
                      />
                    )}
                  </div>
                  
                  {/* Text */}
                  <span className={`text-white font-bold text-lg group-hover:text-yellow-100 transition-colors duration-300 ${
                    item.hasGreeting ? 'text-xl' : ''
                  }`}>
                    {item.text}
                  </span>
                  
                  {/* Sparkle effect for hover */}
                  <div className="absolute top-1 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    ✨
                  </div>
                </div>
                
                {/* Hover shine effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-20 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
              </button>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
