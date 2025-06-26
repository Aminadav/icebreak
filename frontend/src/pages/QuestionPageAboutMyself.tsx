import { useState, useEffect } from 'react';
import PageLayout from '../components/PageLayout';
import MyPoints from '../components/MyPoints';
import ProgressCircles from '../components/ProgressCircles';
import AnswerContainer from '../components/AnswerContainer';
import Button from '../components/Button';
import Footer from '../components/Footer';
import { useGame } from '../contexts/GameContext';

interface QuestionPageProps {
  gameState: GAME_STATE_QUESTION_ABOUT_MYSELF;
}

export default function QuestionAboutYourSelfPage({ 
  gameState, 
}: QuestionPageProps): JSX.Element {
  var question=gameState.question;

  const [selectedAnswerId, setSelectedAnswerId] = useState<string>('');
  const [freeformAnswer, setFreeformAnswer] = useState<string>('');
  const [otherAnswer, setOtherAnswer] = useState<string>('');
  const {gameEmitter} = useGame();

  // Add keyboard event listener for number keys 1-9
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      // Only handle keyboard shortcuts for multiple choice questions
      if (question.question_type !== 'choose_one' || !question.answers) {
        return;
      }

      const key = event.key;
      const numberKey = parseInt(key);
      
      // Check if pressed key is a number 1-9 and within answer range
      if (numberKey >= 1 && numberKey <= 9 && numberKey <= question.answers.length) {
        const answerIndex = numberKey - 1; // Convert to 0-based index
        const selectedAnswer = question.answers[answerIndex];
        
        // Submit the answer immediately
        gameEmitter('submit-answer-myself', {
          questionId: question.question_id,
          answer: selectedAnswer
        });
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    
    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [question, gameEmitter]);

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
      gameEmitter('submit-answer-myself', {
        questionId: question.question_id,
        answer: result
      })
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
      {/* Progress Circles */}
       <div className="pt-14">
        {gameState.introCurrentQuestion !== undefined && gameState.introTotalQuestions!==undefined &&
        <ProgressCircles 
          current={gameState.introCurrentQuestion} 
          total={gameState.introTotalQuestions} 
        />}
      </div>

      {/* Question Content */}
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-6">
        <div className="w-full max-w-2xl">
          {/* Question Text */}
          <h1 className="mb-8 text-4xl font-bold leading-tight text-center text-white md:text-5xl" data-testid="question-text">
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
                    autoFocus
                    autoComplete="off"
                    value={freeformAnswer}
                    onChange={(e) => setFreeformAnswer(e.target.value)}
                    placeholder="הקלד כאן ..."
                    className="w-full h-16 px-6 text-lg text-white transition-all duration-300 bg-transparent border-2 border-white rounded-2xl placeholder-white/70 focus:outline-none focus:border-orange-400 focus:ring-4 focus:ring-orange-400/30"
                    style={{ direction: 'rtl' }}
                    data-testid="question-freeform-input"
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
                clickOnEnter
                onClick={handleSubmit}
                disabled={!canSubmit}
                trackingId="question-submit"
                data-testid="question-submit-button"
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