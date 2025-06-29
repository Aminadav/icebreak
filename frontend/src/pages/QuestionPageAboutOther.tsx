import { useState } from 'react';
import PageLayout from '../components/PageLayout';
import MyPoints from '../components/MyPoints';
import ProgressCircles from '../components/ProgressCircles';
import AnswerContainer from '../components/AnswerContainer';
import Button from '../components/Button';
import Footer from '../components/Footer';
import Avatar from '../components/Avatar';
import { useGame } from '../contexts/GameContext';

interface QuestionPageProps {
  gameState: GAME_STATE_QUESTION_ABOUT_OTHER;
}

export default function QuestionAboutOtherPage({ 
  gameState, 
}: QuestionPageProps): JSX.Element {
  var question=gameState.question;
  var aboutUser=gameState.about_user;
  const {gameEmitter} = useGame();

  const [selectedAnswerId, setSelectedAnswerId] = useState<string>('');
  const [otherAnswer, setOtherAnswer] = useState<string>('');

  // Helper function to escape HTML characters
  const escapeHtml = (text: string): string => {
    return text.replace(/[<>&"']/g, (char) => 
      ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;', "'": '&#x27;' })[char] || char
    );
  };

  const handleAnswerClick = (answerId: string, value?: string) => {
    setSelectedAnswerId(answerId);
    if (answerId === 'other' && value) {
      setOtherAnswer(value);
    }
  };

  const handleOtherAnswerChange = (value: string) => {
    setOtherAnswer(value);
  };

  const handleSubmit = () => {
    let result = '';
    
    if (selectedAnswerId) {
      if (selectedAnswerId === 'other') {
        result = otherAnswer;
      } else if (question.answers) {
        const selectedAnswer = question.answers[parseInt(selectedAnswerId)];
        result = selectedAnswer;
      }
    }
    
    if (result) {
      // Emit socket event for submitting answer about others
      gameEmitter('submit-answer-others', {
        questionId: question.question_id,
        answer: result,
        aboutUserId: aboutUser.user_id
      });
    }
  };

  const canSubmit = selectedAnswerId && (selectedAnswerId !== 'other' || otherAnswer.trim());

  // Convert answers to the format expected by AnswerContainer
  const answerData = question.answers?.map((answer, index) => ({
    id: index.toString(),
    text: answer,
    selected: selectedAnswerId === index.toString()
  })) || [];

  return (
    <PageLayout 
      showHeader={true}
    >
      {/* Question Content */}
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-6">
        <Avatar friend={aboutUser} size='large' animateIndex={1} showName={false} />
        <div className="w-full max-w-2xl mt-5">
          {/* Question Text */}
          <h1 className="mb-8 text-4xl font-bold leading-tight text-center text-white md:text-5xl">
            <span 
              dangerouslySetInnerHTML={{ 
                __html: question.question_text.replace(
                  aboutUser.name || '', 
                  `<span style="text-decoration: underline;">${escapeHtml(aboutUser.name || '')}</span>`
                ) 
              }}
            />
          </h1>

          {/* Answer Section - Always show choices for questions about others */}
          <div className="w-full">
            <AnswerContainer
              answers={answerData}
              onAnswerClick={handleAnswerClick}
              maxAnswers={question.max_answers_to_show || 4}
              allowOther={question.allow_other}
              onOtherAnswerChange={handleOtherAnswerChange}
              otherAnswerValue={otherAnswer}
            />
          </div>

          {/* Submit Button */}
          <div className="flex justify-center mt-8">
            <div className="w-full max-w-xs">
              <Button
                variant={canSubmit ? "primary-large" : "disabled"}
                onClick={handleSubmit}
                disabled={!canSubmit}
                /*trackingId="question-submit"*/
              >
                שלח
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </PageLayout>
  );
}