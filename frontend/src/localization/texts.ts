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
  enterEmail: {
    title: string;
    subtitle: string;
    placeholder: string;
    continueButton: string;
  };
  enterName: {
    title: string;
    placeholder: string;
    continueButton: string;
  };
  nameConfirmation: {
    title: string;
    message: string;
    yesButton: string;
    noButton: string;
  };
  selectGender: {
    introText: string;
    heroText: string;
    endText: string;
    clarificationText: string;
    instructions: string;
    femalePrefer: string;
    femaleLanguage: string;
    malePrefer: string;
    maleLanguage: string;
    skipOption: string;
  };
  pictureUpload: {
    title: string;
    subtitle: string;
    instructions: string;
    cameraButtonText: string;
    whatsappButtonText: string;
    skipOption: string;
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
    },
    enterEmail: {
      title: 'הכנס כתובת אימייל',
      subtitle: 'נשלח לך עדכונים על המשחק',
      placeholder: 'כתובת אימייל...',
      continueButton: 'המשך'
    },
    enterName: {
      title: 'מה השם שלך?',
      placeholder: 'הכנס את שמך...',
      continueButton: 'המשך >>'
    },
    nameConfirmation: {
      title: 'כדי להנות מהמשחק',
      message: 'מומלץ למלא שם אמיתי\nהאם {name} השם האמיתי שלך?',
      yesButton: 'כן',
      noButton: 'לא' 
    },
    selectGender: {
      introText: 'כמו בכל משחק טוב, צריך לדעת איך לפנות אל ',
      heroText: 'הגיבור',
      endText: ' הראשי!',
      clarificationText: 'שזה את או אתה!',
      instructions: 'אני (האפליקציה) מעדיפה שידברו עליי בלשון נקבה, איך בא לך שנדבר עליך במשחק?',
      femalePrefer: 'אני מעדיפה',
      femaleLanguage: 'בלשון נקבה',
      malePrefer: 'אני מעדיף', 
      maleLanguage: 'בלשון זכר',
      skipOption: 'אני מעדיף בלי תמונה'
    },
    pictureUpload: {
      title: 'צלמו רגע תמונה שלכם',
      subtitle: 'גם אם אתה שונאים להצטלם',
      instructions: 'הבינה מלאכותית שלנו תהפוך אתכם לגרסה הכי פוטוגנית שלכם.',
      cameraButtonText: 'לחצו לצילום',
      whatsappButtonText: 'שימוש בתמונות וואצפ',
      skipOption: 'משחק בלי תמונות'
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
    },
    enterEmail: {
      title: 'Enter email address',
      subtitle: 'We will send you game updates',
      placeholder: 'Email address...',
      continueButton: 'Continue'
    },
    enterName: {
      title: 'What is your name?',
      placeholder: 'Enter your name...',
      continueButton: 'Continue >>'
    },
    nameConfirmation: {
      title: 'To enjoy the game',
      message: 'we recommend using a real name. Is {name} your real name?',
      yesButton: 'Yes',
      noButton: 'No'
    },
    selectGender: {
      introText: '"Like every good game, you need to know how to address the ',
      heroText: 'hero',
      endText: '!',
      clarificationText: 'Which is you!',
      instructions: 'I (the app) prefer to be addressed in feminine form, how would you like us to address you in the game?',
      femalePrefer: 'I prefer',
      femaleLanguage: 'feminine form',
      malePrefer: 'I prefer',
      maleLanguage: 'masculine form', 
      skipOption: 'I prefer without image'
    },
    pictureUpload: {
      title: 'Take a moment to capture yourselves',
      subtitle: 'Even if you hate being photographed',
      instructions: 'Our artificial intelligence will turn you into the most photogenic version of yourselves.',
      cameraButtonText: 'Click to Shoot',
      whatsappButtonText: 'Use WhatsApp Photos',
      skipOption: 'Game without photos'
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