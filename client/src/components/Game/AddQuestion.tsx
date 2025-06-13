import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { socketService } from '../../services/socketService';

interface AddQuestionProps {
  roomId: string;
  onClose: () => void;
}

const AddQuestion: React.FC<AddQuestionProps> = ({ roomId, onClose }) => {
  const { t } = useTranslation();
  const [questionText, setQuestionText] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!questionText.trim()) return;

    setLoading(true);
    try {
      socketService.addQuestion(roomId, questionText.trim());
      setQuestionText('');
      onClose();
    } catch (error) {
      console.error('Error adding question:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="card max-w-md w-full">
        <div className="card-header">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">
              {t('game.addQuestion')}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl"
            >
              ×
            </button>
          </div>
        </div>

        <div className="card-body">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="questionText" className="block text-sm font-medium text-gray-700 mb-2">
                נוסח השאלה
              </label>
              <textarea
                id="questionText"
                rows={4}
                className="form-input resize-none"
                placeholder={t('game.questionPlaceholder')}
                value={questionText}
                onChange={(e) => setQuestionText(e.target.value)}
                maxLength={500}
              />
              <div className="flex justify-between items-center mt-2">
                <p className="text-xs text-gray-500">
                  שאלה טובה עוזרת לשחקנים להכיר זה את זה
                </p>
                <span className="text-xs text-gray-400">
                  {questionText.length}/500
                </span>
              </div>
            </div>

            <div className="flex space-x-3 rtl:space-x-reverse">
              <button
                type="submit"
                disabled={loading || !questionText.trim()}
                className="btn-primary flex-1 flex justify-center items-center"
              >
                {loading ? (
                  <div className="loading-spinner"></div>
                ) : (
                  <>
                    ➕ הוסף שאלה
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="btn-secondary flex-1"
              >
                {t('ui.cancel')}
              </button>
            </div>
          </form>

          {/* Examples */}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h4 className="font-medium text-blue-800 mb-2">💡 דוגמאות לשאלות:</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• מה הדבר הכי מעניין שעשיתם השבוע?</li>
              <li>• איך תמיד רציתם לבלות סוף שבוע?</li>
              <li>• מה הכישרון הכי מוזר שיש לכם?</li>
              <li>• איזה מקום בעולם הכי מעניין אתכם לבקר?</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddQuestion;
