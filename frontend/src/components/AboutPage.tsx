import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import PageLayout from './PageLayout';
import AnswerContainer from './AnswerContainer';
import { aboutTexts } from '../localization/about';
import FullScreenModal from './FullScreenModal';

export default function AboutPage(): JSX.Element {
  const { texts } = useLanguage();
  const navigate = useNavigate();
  const isRTL = texts.direction === 'rtl';

  // Use local state for selected content
  const [selectedContent, setSelectedContent] = useState<string | null>(null);

  var [fullScreenModalComponent, setFullScreenModalComponent] = useState<JSX.Element | null>(null);

  // Get current language (he or en)
  const currentLang = texts.direction === 'rtl' ? 'he' : 'en';

  const handleNavigateToContent = (contentType: string) => {
    setSelectedContent(contentType);
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


  return (
    <>
      <FullScreenModal open={!!selectedContent} onRequestClose={() => setSelectedContent(null)}>
        <PageLayout title={"df"}>
          <div className="max-w-4xl p-8 mx-auto mt-20 mb-12 border-2 border-blue-400 shadow-2xl bg-black/80 backdrop-blur-md rounded-3xl">
            <div
              className="text-lg leading-relaxed text-white"
              style={{ direction: isRTL ? 'rtl' : 'ltr', textAlign: isRTL ? 'right' : 'left' }}
            >
              {getContentText().split('\n').map((paragraph: string, index: number) => (
                <p key={index} className="mb-4 last:mb-0">
                  {paragraph}
                </p>
              ))}
            </div>
          </div>
        </PageLayout>

      </FullScreenModal>
    <PageLayout title={texts.about.title}>

      <div className="max-w-4xl px-6 pt-8 mx-auto">
        <>
          {/* Statistics Box */}
          <div className="max-w-md p-8 mx-auto mb-12 border-2 border-green-400 shadow-2xl bg-black/80 backdrop-blur-md rounded-3xl">
            <div className="grid grid-cols-1 gap-6 text-center">
              <div className="space-y-1">
                <div className="text-4xl font-bold text-white">
                  {stats.questions}
                </div>
                <div className="text-lg font-medium text-white/90">
                  {texts.about.stats.questions}
                </div>
              </div>
              <div className="space-y-1">
                <div className="text-4xl font-bold text-white">
                  {stats.participants}
                </div>
                <div className="text-lg font-medium text-white/90">
                  {texts.about.stats.participants}
                </div>
              </div>
              <div className="space-y-1">
                <div className="text-4xl font-bold text-white">
                  {stats.playing}
                </div>
                <div className="text-lg font-medium text-white/90">
                  {texts.about.stats.playing}
                </div>
              </div>
            </div>
          </div>

          {/* Question Title */}
          <div className="mb-12 text-center">
            <h2 className="mb-2 text-4xl font-bold text-white drop-shadow-lg">
              {texts.about.questionTitle}
            </h2>
          </div>

          {/* Options using AnswerContainer */}
          <div className="max-w-2xl mx-auto mb-12">
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
      </div>
    </PageLayout>
    </>
  );
}
