import { useState } from 'react';
import PageLayout from '../components/PageLayout';
import MyPoints from '../components/MyPoints';
import ProgressCircles from '../components/ProgressCircles';
import AnswerContainer from '../components/AnswerContainer';
import Button from '../components/Button';
import Footer from '../components/Footer';

interface QuestionPageProps {
  gameState: GAME_STATE_QUESTION_ABOUT_OTHER;
}

export default function QuestionAboutOtherPage({ 
  gameState, 
}: QuestionPageProps): JSX.Element {
  var question=gameState.question;

  const [selectedAnswerId, setSelectedAnswerId] = useState<string>('');
  const [freeformAnswer, setFreeformAnswer] = useState<string>('');
  const [otherAnswer, setOtherAnswer] = useState<string>('');

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
    
    if (question.question_type === 'choose_one' && selectedAnswerId) {
      if (selectedAnswerId === 'other') {
        result = otherAnswer;
      } else if (question.answers) {
        const selectedAnswer = question.answers[parseInt(selectedAnswerId)];
        result = selectedAnswer;
      }
    } else if (question.question_type === 'free_form' && freeformAnswer.trim()) {
      result = freeformAnswer.trim();
    }
    
    if (result) {
      alert(`User answer: ${result}`);
    }
  };

  const canSubmit = 
    (question.question_type === 'choose_one' && selectedAnswerId && 
     (selectedAnswerId !== 'other' || otherAnswer.trim())) ||
    (question.question_type === 'free_form' && freeformAnswer.trim());

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
      {/* Points Display */}
      <MyPoints  />
      
      {/* Question Content */}
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-6">
        <div className="w-full max-w-2xl">
          {/* Question Text */}
          <h1 className="mb-8 text-4xl font-bold leading-tight text-center text-white md:text-5xl">
            {question.question_text}
          </h1>

          {/* Answer Section */}
          <div className="w-full">
            {question.question_type === 'choose_one' ? (
              <AnswerContainer
                answers={answerData}
                onAnswerClick={handleAnswerClick}
                maxAnswers={4}
                allowOther={question.allow_other}
                onOtherAnswerChange={handleOtherAnswerChange}
                otherAnswerValue={otherAnswer}
              />
            ) : (
              /* Free Form Input */
              <div className="space-y-6">
                <div className="relative">
                  <input
                    type="text"
                    value={freeformAnswer}
                    onChange={(e) => setFreeformAnswer(e.target.value)}
                    placeholder="הקלד כאן ..."
                    className="w-full h-16 px-6 text-lg text-white transition-all duration-300 bg-transparent border-2 border-white rounded-2xl placeholder-white/70 focus:outline-none focus:border-orange-400 focus:ring-4 focus:ring-orange-400/30"
                    style={{ direction: 'rtl' }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Submit Button */}
          <div className="flex justify-center mt-8">
            <div className="w-full max-w-xs">
              <Button
                variant={canSubmit ? "primary-large" : "disabled"}
                onClick={handleSubmit}
                disabled={!canSubmit}
                trackingId="question-submit"
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