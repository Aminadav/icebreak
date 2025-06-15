interface Texts {
  direction: 'rtl' | 'ltr';
  menu: {
    title: string;
    greeting: string;
    mute: string;
    shareGame: string;
    champions: string;
    dashboard: string;
    myGames: string;
    createGame: string;
    components: string;
    help: string;
    about: string;
    updates: string;
    logout: string;
  };
  common: {
    switchToEnglish: string;
    switchToHebrew: string;
  };
  about: {
    title: string;
    questionTitle: string;
    stats: {
      questions: string;
      participants: string;
      playing: string;
    };
    buttons: {
      longStories: string;
      summaryRead: string;
      workDeals: string;
      pressOrInfluencer: string;
    };
  };
  homepage: {
    title: string;
    subtitle: string;
    createGameButton: string;
  };
  giveGameName: {
    title: string;
    subtitle: string;
    placeholder: string;
    continueButton: string;
  };
  enterPhoneNumber: {
    title: string;
    subtitle: string;
    placeholder: string;
    continueButton: string;
  };
  enter2faCode: {
    title: string;
    placeholder: string;
    continueButton: string;
  };
}

export const texts: Record<'he' | 'en', Texts> = {
  he: {
    direction: 'rtl',
    menu: {
      title: 'תפריט משחק',
      greeting: 'שלום שלמה!',
      mute: 'השתק',
      shareGame: 'הזמנה למשחק זה',
      champions: 'אלופי הקבוצה',
      dashboard: 'דשבורד',
      myGames: 'המשחקים שלי',
      createGame: 'יצירת משחק חדש',
      components: 'דוגמאות קומפוננטות',
      help: 'עזרה וצור קשר',
      about: 'אודות IceBreak',
      updates: 'עידכונים וחדשות',
      logout: 'התנתקות'
    },
    common: {
      switchToEnglish: 'English',
      switchToHebrew: 'עברית'
    },
    about: {
      title: 'אודות IceBreak',
      questionTitle: 'איזה סוג אנשים אתם?',
      stats: {
        questions: 'שאלות',
        participants: 'משתתפים',
        playing: 'משחקים'
      },
      buttons: {
        longStories: 'אוהבים סיפורים ארוכים',
        summaryRead: 'מעדיפים לקרוא סיכומים',
        workDeals: 'עסוקים, תענו לי במשפט',
        pressOrInfluencer: 'עיתונאים או משפיעני רשת'
      }
    },
    homepage: {
      title: 'IceBreak!',
      subtitle: 'משחק גיבוש לחברים בקבוצות WhatsApp',
      createGameButton: 'יצירת משחק לקבוצה שלי >>'
    },
    giveGameName: {
      title: 'תנו שם למשחק',
      subtitle: 'אנחנו ממליצים לתת את השם של קבוצת הווצאפ שלכם',
      placeholder: 'שם המשחק...',
      continueButton: 'המשך'
    },
    enterPhoneNumber: {
      title: 'הכניסה מותרת רק לחברי הקבוצה',
      subtitle: 'הכניסו מספר טלפון',
      placeholder: '(052)',
      continueButton: 'שלח'
    },
    enter2faCode: {
      title: 'הכנס קוד אימות',
      placeholder: '_ _ _ _ _ _',
      continueButton: 'המשך'
    }
  },
  en: {
    direction: 'ltr',
    menu: {
      title: 'Game Menu',
      greeting: 'Hello Shlomo!',
      mute: 'Mute',
      shareGame: 'Invite to this game',
      champions: 'Group Champions',
      dashboard: 'Dashboard',
      myGames: 'My Games',
      createGame: 'Create New Game',
      components: 'Components Showcase',
      help: 'Help & Contact',
      about: 'About IceBreak',
      updates: 'Updates & News',
      logout: 'Logout'
    },
    common: {
      switchToEnglish: 'English',
      switchToHebrew: 'עברית'
    },
    about: {
      title: 'About IceBreak',
      questionTitle: 'What type of people are you?',
      stats: {
        questions: 'Questions',
        participants: 'Participants',
        playing: 'Playing'
      },
      buttons: {
        longStories: 'Love long stories',
        summaryRead: 'Prefer to read summaries',
        workDeals: 'Busy, answer me in one sentence',
        pressOrInfluencer: 'Press or influencers'
      }
    },
    homepage: {
      title: 'IceBreak!',
      subtitle: 'Team building game for friends in WhatsApp groups',
      createGameButton: 'Create Game for My Group'
    },
    giveGameName: {
      title: 'Give Your Game a Name',
      subtitle: 'We recommend using your WhatsApp group name',
      placeholder: 'Game name...',
      continueButton: 'Continue'
    },
    enterPhoneNumber: {
      title: 'Entry allowed only for group members',
      subtitle: 'Enter phone number',
      placeholder: '(052)',
      continueButton: 'Send'
    },
    enter2faCode: {
      title: 'Enter verification code',
      placeholder: '_ _ _ _ _ _',
      continueButton: 'Continue'
    }
  }
};

// Language context
export type Language = 'he' | 'en';

// Simple state management for current language
let currentLanguage: Language = 'he';

export const getCurrentLanguage = (): Language => currentLanguage;
export const setLanguage = (lang: Language) => {
  currentLanguage = lang;
  // Update document direction
  document.dir = texts[lang].direction;
};
export const getText = (lang: Language = getCurrentLanguage()) => texts[lang];
export const toggleLanguage = () => {
  const newLang = currentLanguage === 'he' ? 'en' : 'he';
  setLanguage(newLang);
  return newLang;
};