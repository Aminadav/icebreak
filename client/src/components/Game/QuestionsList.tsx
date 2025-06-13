import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useGameStore } from '../../stores/gameStore';
import { socketService } from '../../services/socketService';

interface QuestionListProps {
  roomId: string;
}

const QuestionsList: React.FC<QuestionListProps> = ({ roomId }) => {
  const { t } = useTranslation();
  const { questions, answers } = useGameStore();
  const [answerInputs, setAnswerInputs] = useState<Record<string, string>>({});
  const [submittingAnswers, setSubmittingAnswers] = useState<Record<string, boolean>>({});

  const handleAnswerChange = (questionId: string, value: string) => {
    setAnswerInputs(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  const handleSubmitAnswer = async (questionId: string) => {
    const answer = answerInputs[questionId]?.trim();
    if (!answer) return;

    setSubmittingAnswers(prev => ({ ...prev, [questionId]: true }));

    try {
      socketService.submitAnswer(questionId, answer);
      // Clear input after successful submission
      setAnswerInputs(prev => ({
        ...prev,
        [questionId]: ''
      }));
    } catch (error) {
      console.error('Error submitting answer:', error);
    } finally {
      setSubmittingAnswers(prev => ({ ...prev, [questionId]: false }));
    }
  };

  const getAnswersForQuestion = (questionId: string) => {
    return answers.filter(answer => answer.questionId === questionId);
  };

  if (questions.length === 0) {
    return (
      <div className="card">
        <div className="card-body">
          <div className="text-center py-8">
            <div className="text-4xl mb-4">❓</div>
            <p className="text-gray-600 mb-4">
              עדיין אין שאלות במשחק
            </p>
            <p className="text-sm text-gray-500">
              הוסיפו את השאלה הראשונה כדי להתחיל!
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {questions.map((question, index) => {
        const questionAnswers = getAnswersForQuestion(question.id);
        const currentAnswer = answerInputs[question.id] || '';
        const isSubmitting = submittingAnswers[question.id] || false;

        return (
          <div key={question.id} className="card">
            <div className="card-header">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 rtl:space-x-reverse mb-2">
                    <span className="bg-primary-100 text-primary-700 text-sm font-semibold px-3 py-1 rounded-full">
                      שאלה {index + 1}
                    </span>
                    <span className="text-xs text-gray-500">
                      {questionAnswers.length} תשובות
                    </span>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900">
                    {question.text}
                  </h3>
                </div>
              </div>
            </div>

            <div className="card-body">
              {/* Answer Input */}
              <div className="mb-6">
                <div className="flex space-x-3 rtl:space-x-reverse">
                  <input
                    type="text"
                    placeholder={t('game.answerPlaceholder')}
                    value={currentAnswer}
                    onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                    className="form-input flex-1"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && !isSubmitting && currentAnswer.trim()) {
                        handleSubmitAnswer(question.id);
                      }
                    }}
                  />
                  <button
                    onClick={() => handleSubmitAnswer(question.id)}
                    disabled={isSubmitting || !currentAnswer.trim()}
                    className="btn-primary px-6 flex items-center"
                  >
                    {isSubmitting ? (
                      <div className="loading-spinner w-4 h-4"></div>
                    ) : (
                      t('game.submitAnswer')
                    )}
                  </button>
                </div>
              </div>

              {/* Existing Answers */}
              {questionAnswers.length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">
                    תשובות השחקנים:
                  </h4>
                  <div className="space-y-3">
                    {questionAnswers.map((answer) => (
                      <div
                        key={answer.id}
                        className="bg-gray-50 rounded-lg p-4"
                      >
                        <div className="flex items-start space-x-3 rtl:space-x-reverse">
                          <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                            <span className="text-primary-600 text-sm font-semibold">
                              {answer.user.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 rtl:space-x-reverse mb-1">
                              <span className="font-medium text-gray-900">
                                {answer.user.name}
                              </span>
                              <span className="text-xs text-gray-500">
                                {new Date(answer.createdAt).toLocaleString('he-IL')}
                              </span>
                            </div>
                            <p className="text-gray-700">{answer.answer}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default QuestionsList;
