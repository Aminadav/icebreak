import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import PageLayout from './PageLayout';
import AnswerContainer from './AnswerContainer';
import { aboutTexts } from '../localization/about';

export default function AboutPage(): JSX.Element {
  const { texts } = useLanguage();
  const navigate = useNavigate();
  const isRTL = texts.direction === 'rtl';
  
  // Use local state for selected content
  const [selectedContent, setSelectedContent] = useState<string | null>(null);
  
  // Get current language (he or en)
  const currentLang = texts.direction === 'rtl' ? 'he' : 'en';

  const handleNavigateToContent = (contentType: string) => {
    setSelectedContent(contentType);
  };

  const handleBack = () => {
    if (selectedContent) {
      // If viewing content, go back to about main page
      setSelectedContent(null);
    } else {
      // If on about main page, go back to home
      navigate('/');
    }
  };

  // Get the content to display based on selected content type
  const getContentText = () => {
    if (!selectedContent) return '';
    return aboutTexts[currentLang as keyof typeof aboutTexts][selectedContent as keyof typeof aboutTexts.he] || '';
  };

  // מספרים לדוגמה
  const stats = {
    questions: '492,321',
    participants: '32,292',
    playing: '2,292'
  };

  const buttons = [
    { 
      id: 'longStory',
      text: texts.about.buttons.longStories, 
      emoji: ''
    },
    { 
      id: 'summary',
      text: texts.about.buttons.summaryRead, 
      emoji: ''
    },
    { 
      id: 'workDeals',
      text: texts.about.buttons.workDeals, 
      emoji: ''
    },
    { 
      id: 'pressInfluencer',
      text: texts.about.buttons.pressOrInfluencer, 
      emoji: ''
    }
  ];

  const handleOptionClick = (optionId: string) => {
    // Use local state for content navigation
    handleNavigateToContent(optionId);
  };

  const handleBackFromContent = () => {
    // Clear selected content
    setSelectedContent(null);
  };

  return (
    <PageLayout onBack={selectedContent ? handleBackFromContent : handleBack} title={texts.about.title}>
      <div className="px-6 max-w-4xl mx-auto pt-8">
        {!selectedContent ? (
          <>
            {/* Statistics Box */}
            <div className="bg-black/80 backdrop-blur-md rounded-3xl p-8 mb-12 border-2 border-green-400 shadow-2xl mx-auto max-w-md">
              <div className="grid grid-cols-1 gap-6 text-center">
                <div className="space-y-1">
                  <div className="text-4xl font-bold text-white">
                    {stats.questions}
                  </div>
                  <div className="text-white/90 text-lg font-medium">
                    {texts.about.stats.questions}
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="text-4xl font-bold text-white">
                    {stats.participants}
                  </div>
                  <div className="text-white/90 text-lg font-medium">
                    {texts.about.stats.participants}
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="text-4xl font-bold text-white">
                    {stats.playing}
                  </div>
                  <div className="text-white/90 text-lg font-medium">
                    {texts.about.stats.playing}
                  </div>
                </div>
              </div>
            </div>

            {/* Question Title */}
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-white drop-shadow-lg mb-2">
                {texts.about.questionTitle}
              </h2>
            </div>

            {/* Options using AnswerContainer */}
            <div className="mb-12 max-w-2xl mx-auto">
              <AnswerContainer
                answers={buttons.map(button => ({
                  id: button.id,
                  text: `${button.emoji} ${button.text}`
                }))}
                onAnswerClick={handleOptionClick}
                maxAnswers={4}
              />
            </div>
          </>
        ) : (
          /* Content Display */
          <div className="bg-black/80 backdrop-blur-md rounded-3xl p-8 mb-12 border-2 border-blue-400 shadow-2xl mx-auto max-w-4xl">
            <div 
              className="text-white leading-relaxed text-lg" 
              style={{ direction: isRTL ? 'rtl' : 'ltr', textAlign: isRTL ? 'right' : 'left' }}
            >
              {getContentText().split('\n').map((paragraph: string, index: number) => (
                <p key={index} className="mb-4 last:mb-0">
                  {paragraph}
                </p>
              ))}
            </div>
          </div>
        )}
      </div>
    </PageLayout>
  );
}
