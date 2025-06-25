import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { useTracking } from '../contexts/TrackingContext';
import { useSocket } from '../contexts/SocketContext';
import { useGame } from '../contexts/GameContext';

export default function TopMenu({ isOpen, onClose }: {
  isOpen: boolean;
  onClose: () => void;
}): JSX.Element {
  const { texts, language, toggleLanguage } = useLanguage();
  const { trackEvent } = useTracking();
  const { socket } = useSocket();
  const navigate = useNavigate();
  const { userData, isLoggedIn } = useSocket();
  const isRTL = texts.direction === 'rtl';

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const menuItems = [
    {
      title: texts.menu.greeting + ' ' + userData?.name + '!',
      icon: '👋',
      gradient: 'from-yellow-400 to-orange-500',
      isEmoji: true,
      hasGreeting: true,
      hide: !isLoggedIn,
      onClick: () => { }
    },
    {
      title: language === 'he' ? texts.common.switchToEnglish : texts.common.switchToHebrew,
      icon: language === 'he' ? '🇺🇸' : '🇮🇱',
      gradient: 'from-blue-500 to-purple-600',
      isEmoji: true,
      isSmaller: true,
      onClick: () => {
        trackEvent('language_toggle_clicked', {
          current_language: language,
          new_language: language === 'he' ? 'en' : 'he'
        });
        toggleLanguage();
      }
    },
    {
      title: texts.menu.mute,
      icon: '/images/icons/mute.svg',
      gradient: 'from-purple-400 to-purple-600',
      onClick: () => console.log('Mute clicked')
    },
    {
      title: texts.menu.shareGame,
      icon: '/images/icons/share.svg',
      gradient: 'from-blue-400 to-blue-600',
      onClick: () => console.log('Share game clicked')
    },
    {
      title: texts.menu.champions,
      icon: '/images/icons/champions.svg',
      gradient: 'from-yellow-500 to-yellow-700',
      onClick: () => console.log('Champions clicked')
    },
    {
      title: texts.menu.dashboard,
      icon: '/images/icons/dashboard.svg',
      gradient: 'from-green-400 to-green-600',
      onClick: () => console.log('Dashboard clicked')
    },
    {
      title: texts.menu.myGames,
      icon: '/images/icons/my_games.svg',
      gradient: 'from-pink-400 to-pink-600',
      onClick: () => console.log('My games clicked')
    },
    {
      title: texts.menu.createGame,
      icon: '/images/icons/icons/plus.svg',
      gradient: 'from-emerald-400 to-emerald-600',
      onClick: () => console.log('Create game clicked')
    },
    {
      title: texts.menu.components,
      icon: '🎨',
      gradient: 'from-indigo-400 to-pink-500',
      isEmoji: true,
      // onClick: () => onMenuAction?.('components')
    },
    {
      title: texts.menu.help,
      icon: '/images/icons/whatsapp.svg',
      gradient: 'from-cyan-400 to-cyan-600',
      link: 'https://chat.whatsapp.com/GbDiSa5pMNsLWgnTlDjXm5',
      onClick: () => window.open('https://chat.whatsapp.com/GbDiSa5pMNsLWgnTlDjXm5', '_blank')
    },
    {
      title: texts.menu.about,
      icon: '/images/icons/about.svg',
      gradient: 'from-indigo-400 to-indigo-600',
      // onClick: () => onMenuAction?.('about')
    },
    {
      title: texts.menu.updates,
      icon: '/images/icons/whatsapp.svg',
      gradient: 'from-red-400 to-red-600',
      link: 'https://chat.whatsapp.com/GzczSiemSHxEKOMIkrxBOb',
      onClick: () => window.open('https://chat.whatsapp.com/GzczSiemSHxEKOMIkrxBOb', '_blank')
    },
    {
      title: texts.menu.logout,
      icon: '/images/icons/logout.svg',
      gradient: 'from-gray-400 to-gray-600',
      hide: !isLoggedIn,
      onClick: () => {
        if (socket) {
          trackEvent('logout_clicked', {});
          socket.emit('logout', {});
          socket.once('logout_response', (response) => {
            if (response.success) {
              console.log('✅ Logout successful');
            } else {
              console.error('❌ Logout failed:', response.error);
            }
            navigate('/');
          });
        } else {
          navigate('/');
        }
        onClose();
      }
    }
  ];

  return (
    <>
      {/* Overlay */}
      <div
        className={`fixed inset-0 bg-black bg-opacity-50 transition-opacity duration-300 z-40 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
        onClick={handleOverlayClick}
      />

      {/* Menu */}
      <div
        className={`fixed top-[60px] right-0 w-[300px] bg-gradient-to-br via-white shadow-2xl z-50 transform transition-transform duration-300 ease-out border-l-4 border-gradient-to-b from-blue-400 to-purple-500 ${isOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
        style={{
          maxHeight: 'calc(100vh - 60px)',
          overflowY: 'auto',
          borderImage: 'linear-gradient(45deg, #3b82f6, #8b5cf6) 1'
        }}
      >
        <div className="p-5">
          {/* Header */}
          <div className="mb-6 text-center">
            <div className="mb-2 text-2xl">🎮</div>
            <div className="text-lg font-bold text-transparent bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text">
              {texts.menu.title}
            </div>
          </div>

          {/* Menu Items */}
          <div className="space-y-3">
            {menuItems
              .filter(item => !item.hide)
              .map((item, index) => (
                <button
                  key={index}
                  className={`group relative overflow-hidden rounded-xl transition-all duration-300 transform hover:scale-102 hover:shadow-xl shadow-md ${item.hasGreeting
                      ? 'mb-4 border-2 border-dashed border-yellow-300 bg-gradient-to-r from-yellow-100 to-orange-100 w-full'
                      : 'hover:-translate-y-1'
                    } ${item.isSmaller ? 'mb-6 w-auto ml-auto' : 'w-full'
                    }`}
                  onClick={() => {
                    const menuItemKey = item.title.toLowerCase().replace(/\s+/g, '_');
                    trackEvent('menu_item_clicked', {
                      menu_item: menuItemKey,
                      has_link: !!item.link,
                      text: item.title
                    });
                    item.onClick?.();
                    if (!item.isSmaller) onClose();
                  }}
                >
                  {/* Gradient Background */}
                  <div className={`absolute inset-0 bg-gradient-to-r ${item.gradient} opacity-90 group-hover:opacity-100 transition-opacity duration-300`} />

                  {/* Content */}
                  <div className={`relative flex items-center gap-4 ${item.isSmaller ? 'px-4 py-3' : 'px-5 py-4'
                    } ${isRTL ? 'text-right' : 'text-left'}`}>
                    {/* Icon */}
                    <div className={`flex-shrink-0 transition-transform duration-300 group-hover:scale-125 group-hover:rotate-12 filter drop-shadow-lg ${item.isSmaller ? 'text-lg' : 'text-2xl'
                      }`}>
                      {item.isEmoji ? (
                        <span>{item.icon}</span>
                      ) : (
                        <img
                          src={item.icon}
                          alt={item.title}
                          className="w-6 h-6 filter brightness-0 invert"
                        />
                      )}
                    </div>

                    {/* Text */}
                    <span className={`text-white font-bold group-hover:text-yellow-100 transition-colors duration-300 ${item.hasGreeting ? 'text-xl' : item.isSmaller ? 'text-sm' : 'text-lg'
                      }`}>
                      {item.title}
                    </span>

                    {/* Sparkle effect */}
                    <div className="absolute transition-opacity duration-300 opacity-0 top-1 right-2 group-hover:opacity-100">
                      ✨
                    </div>
                  </div>

                  {/* Hover shine effect */}
                  <div className="absolute inset-0 transition-transform duration-700 transform -translate-x-full -skew-x-12 opacity-0 bg-gradient-to-r from-transparent via-white to-transparent group-hover:opacity-20 group-hover:translate-x-full" />
                </button>
              ))}
          </div>
        </div>
      </div>
    </>
  );
}
