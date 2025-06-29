import { useState, useEffect } from 'react';
import { useSocket } from '../contexts/SocketContext';
import { Link } from 'react-router-dom';
import OnClickCopyToClipboard from '../components/OnClickCopyToClipboard';

const SENSITIVITY_DESCRIPTIONS: Record<string, string> = {
  low: 'נמוך - אפשר לספר לכל אחד, כמו נהג אוטובוס',
  medium: 'בינוני - למישהו שמכירים ומרגישים איתו בנוח',
  high: 'גבוה - למישהו שסומכים עליו ויש קשר טוב'
};

interface Question {
  question_id: string;
  question_text: string;
  question_about_male?: string;
  question_about_female?: string;
  question_about_other?: string;
  question_type: 'free_form' | 'choose_one';
  answers?: string[];
  allow_other: boolean;
  sensitivity: 'low' | 'medium' | 'high';
  max_answers_to_show: number;
}

export default function EditQuestionsPage(): JSX.Element {
  const { socket } = useSocket();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [editingField, setEditingField] = useState<{questionId: string, field: string} | null>(null);
  const [editingValue, setEditingValue] = useState<string>('');
  const [message, setMessage] = useState<string>('');
  const [sortBy, setSortBy] = useState<'created_at' | 'sensitivity'>('created_at');
  const [newQuestionId, setNewQuestionId] = useState<string | null>(null);

  // Socket listeners
  useEffect(() => {
    if (!socket) return;
    
    const handleQuestionsList = (data: any) => {
      setQuestions(data.questions || []);
    };
    
    const handleQuestionCreated = (data: any) => {
      setQuestions((prev) => [data.question, ...prev]);
      setNewQuestionId(data.question.question_id);
      // Scroll to the new question after a short delay
      setTimeout(() => {
        const element = document.querySelector(`[data-question-id="${data.question.question_id}"]`);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
          // Clear the highlight after a few seconds
          setTimeout(() => setNewQuestionId(null), 3000);
        }
      }, 100);
    };
    
    const handleQuestionUpdated = (data: any) => {
      setQuestions((prev) => prev.map(q => q.question_id === data.question.question_id ? data.question : q));
      setEditingField(null);
    };
    
    const handleQuestionDeleted = (data: any) => {
      setQuestions((prev) => prev.filter(q => q.question_id !== data.questionId));
      setMessage('🗑️ שאלה נמחקה');
    };
    
    const handleError = (data: any) => {
      setMessage(`❌ שגיאה: ${data.message}`);
    };

    socket.on('questions_list', handleQuestionsList);
    socket.on('question_created', handleQuestionCreated);
    socket.on('question_updated', handleQuestionUpdated);
    socket.on('question_deleted', handleQuestionDeleted);
    socket.on('error', handleError);

    socket.emit('get_questions');

    return () => {
      socket.off('questions_list', handleQuestionsList);
      socket.off('question_created', handleQuestionCreated);
      socket.off('question_updated', handleQuestionUpdated);
      socket.off('question_deleted', handleQuestionDeleted);
      socket.off('error', handleError);
    };
  }, [socket]);

  // Clear message after 3 seconds
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(''), 3000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  // Create new question (immediately saves)
  const createNewQuestion = () => {
    if (!socket) return;
    
    const newQuestion = {
      questionText: 'שאלה חדשה - לחץ לעריכה',
      questionAboutMale: '',
      questionAboutFemale: '',
      questionAboutOther: '',
      questionType: 'free_form',
      answers: [],
      allowOther: false,
      sensitivity: 'low',
      maxAnswersToShow: 4,
    };

    socket.emit('save_question', newQuestion);
  };

  // In-place editing functions
  const startEditing = (questionId: string, field: string, currentValue: string) => {
    setEditingField({ questionId, field });
    setEditingValue(currentValue || '');
  };

  const saveEdit = (questionId: string, field: string) => {
    if (!socket) return;
    
    const question = questions.find(q => q.question_id === questionId);
    if (!question) return;

    const updateData = {
      questionId,
      questionText: field === 'question_text' ? editingValue : question.question_text,
      questionAboutMale: field === 'question_about_male' ? editingValue : (question.question_about_male || ''),
      questionAboutFemale: field === 'question_about_female' ? editingValue : (question.question_about_female || ''),
      questionAboutOther: field === 'question_about_other' ? editingValue : (question.question_about_other || ''),
      questionType: question.question_type,
      answers: question.answers || [],
      allowOther: question.allow_other,
      sensitivity: question.sensitivity,
      maxAnswersToShow: question.max_answers_to_show,
    };

    socket.emit('save_question', updateData);
  };

  const cancelEdit = () => {
    setEditingField(null);
    setEditingValue('');
  };

  const handleKeyPress = (e: React.KeyboardEvent, questionId: string, field: string) => {
    if (e.key === 'Enter') {
      saveEdit(questionId, field);
    } else if (e.key === 'Escape') {
      cancelEdit();
    }
  };

  // Update question fields
  const updateQuestionField = (questionId: string, field: string, value: any) => {
    if (!socket) return;
    
    const question = questions.find(q => q.question_id === questionId);
    if (!question) return;

    const updateData = {
      questionId,
      questionText: question.question_text,
      questionAboutMale: question.question_about_male || '',
      questionAboutFemale: question.question_about_female || '',
      questionAboutOther: question.question_about_other || '',
      questionType: field === 'questionType' ? value : question.question_type,
      answers: field === 'answers' ? value : (question.answers || []),
      allowOther: field === 'allowOther' ? value : question.allow_other,
      sensitivity: field === 'sensitivity' ? value : question.sensitivity,
      maxAnswersToShow: field === 'maxAnswersToShow' ? value : question.max_answers_to_show,
    };

    socket.emit('save_question', updateData);
  };

  // Answer management for all question types
  const addAnswer = (questionId: string) => {
    const question = questions.find(q => q.question_id === questionId);
    if (!question) return;

    const newAnswerText = 'תשובה'
    const newAnswers = [...(question.answers || []), newAnswerText];
    updateQuestionField(questionId, 'answers', newAnswers);
  };

  const updateAnswer = (questionId: string, answerIndex: number, newValue: string) => {
    const question = questions.find(q => q.question_id === questionId);
    if (!question) return;

    const newAnswers = [...(question.answers || [])];
    newAnswers[answerIndex] = newValue;
    updateQuestionField(questionId, 'answers', newAnswers);
  };

  const removeAnswer = (questionId: string, answerIndex: number) => {
    const question = questions.find(q => q.question_id === questionId);
    if (!question) return;

    const newAnswers = [...(question.answers || [])];
    newAnswers.splice(answerIndex, 1);
    updateQuestionField(questionId, 'answers', newAnswers);
  };

  const deleteQuestion = (questionId: string) => {
    if (!socket) return;
    if (confirm('האם אתה בטוח שברצונך למחוק את השאלה?')) {
      socket.emit('delete_question', { questionId });
    }
  };

  // Cycle through question types
  const cycleQuestionType = (questionId: string) => {
    const question = questions.find(q => q.question_id === questionId);
    if (!question) return;
    
    const nextType = question.question_type === 'free_form' ? 'choose_one' : 'free_form';
    updateQuestionField(questionId, 'questionType', nextType);
  };

  // Sorting
  const sortedQuestions = [...questions].sort((a, b) => {
    if (sortBy === 'created_at') {
      return b.question_id.localeCompare(a.question_id); // Newer first
    } else {
      const order = { low: 1, medium: 2, high: 3 };
      return order[a.sensitivity] - order[b.sensitivity];
    }
  });

  // Generate tab index based on question index and element type
  const getTabIndex = (questionIndex: number, elementType: string, subIndex?: number) => {
    const baseIndex = 10 + (questionIndex * 20); // Leave space for header elements (1-9)
    switch (elementType) {
      case 'delete': return baseIndex + 1;
      case 'question_text': return baseIndex + 2;
      case 'question_about_male': return baseIndex + 3;
      case 'question_about_female': return baseIndex + 4;
      case 'question_type': return baseIndex + 5;
      case 'sensitivity': return baseIndex + 6;
      case 'max_answers': return baseIndex + 7;
      case 'add_answer': return baseIndex + 8;
      case 'answer': return baseIndex + 9 + (subIndex || 0);
      case 'remove_answer': return baseIndex + 15 + (subIndex || 0);
      case 'allow_other': return baseIndex + 19;
      default: return baseIndex;
    }
  };

  // Render editable field
  const renderEditableField = (question: Question, field: string, value: string, placeholder: string = '', questionIndex: number, elementType: string) => {
    const isEditing = editingField?.questionId === question.question_id && editingField?.field === field;
    
    if (isEditing) {
      return (
        <input
          type="text"
          value={editingValue}
          onChange={(e) => setEditingValue(e.target.value)}
          onBlur={() => saveEdit(question.question_id, field)}
          onKeyDown={(e) => handleKeyPress(e, question.question_id, field)}
          className="w-full p-1 text-sm text-white bg-gray-700 border border-blue-500 rounded focus:outline-none focus:ring-1 focus:ring-blue-400"
          autoFocus
          style={{ direction: 'rtl' }}
          tabIndex={getTabIndex(questionIndex, elementType)}
        />
      );
    }

    return (
      <div
        className="p-1 min-h-[32px] cursor-pointer hover:bg-gray-700 rounded border-2 border-transparent hover:border-gray-600 transition-colors focus:outline-none focus:ring-1 focus:ring-blue-400 focus:border-blue-500"
        onClick={() => startEditing(question.question_id, field, value)}
        title="לחץ לעריכה"
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            startEditing(question.question_id, field, value);
          }
        }}
        style={{ direction: 'rtl' }}
        tabIndex={getTabIndex(questionIndex, elementType)}
      >
        {value || <span className="text-gray-500 italic text-sm">{placeholder}</span>}
      </div>
    );
  };

  return (
    <div className="min-h-screen p-4 text-white bg-gray-900 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex flex-col items-start justify-between gap-4 mb-6 md:flex-row md:items-center">
          <div>
            <h1 className="text-2xl font-bold md:text-3xl">❓ ניהול שאלות</h1>
            <p className="mt-1 text-gray-400">עריכה וניהול של שאלות המשחק - לחץ על כל שדה לעריכה</p>
          </div>
          <div className="flex gap-2">
            <Link 
              to="/admin" 
              className="px-3 py-2 text-sm text-white bg-gray-600 rounded-lg hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-400"
              tabIndex={1}
            >
              ← חזור לאדמין
            </Link>
            <button 
              onClick={createNewQuestion}
              className="px-3 py-2 text-sm text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
              tabIndex={2}
            >
              + שאלה חדשה
            </button>
          </div>
        </div>

        {/* Sorting Controls */}
        <div className="flex items-center gap-3 mb-4">
          <span className="text-sm text-gray-400">מיון לפי:</span>
          <button
            onClick={() => setSortBy('created_at')}
            className={`px-3 py-1 text-xs rounded transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400 ${
              sortBy === 'created_at' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
            tabIndex={3}
          >
            תאריך יצירה (חדש לישן)
          </button>
          <button
            onClick={() => setSortBy('sensitivity')}
            className={`px-3 py-1 text-xs rounded transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400 ${
              sortBy === 'sensitivity' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
            tabIndex={4}
          >
            רגישות (נמוך לגבוה)
          </button>
        </div>

        {/* Status Message */}
        {message && (
          <div className={`rounded-lg p-3 mb-4 text-sm ${message.includes('שגיאה') ? 'bg-red-900 border border-red-600' : 'bg-green-900 border border-green-600'}`}>
            {message}
          </div>
        )}

        {/* Questions List */}
        <div className="space-y-4">
          {/* Always visible new question at top */}
          <div className="sticky top-4 z-10 p-4 bg-gray-800 border-2 border-dashed border-blue-500 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="px-2 py-1 text-xs font-bold text-white bg-blue-600 rounded">חדש</span>
                <span className="text-sm text-gray-300">שאלה חדשה</span>
              </div>
              <button 
                onClick={createNewQuestion}
                className="px-3 py-2 text-sm text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
                tabIndex={5}
              >
                + צור שאלה
              </button>
            </div>
            <p className="text-xs text-gray-400">לחץ כדי ליצור שאלה חדשה. השאלה תופיע בראש הרשימה ותוכל לערוך אותה מיד.</p>
          </div>

          {sortedQuestions.map((question, idx) => (
            <div 
              key={question.question_id} 
              className={`p-4 rounded-lg ${newQuestionId === question.question_id ? 'bg-gray-800 border-2 border-blue-500 shadow-lg shadow-blue-500/20' : 'bg-gray-800'}`} 
              data-question-id={question.question_id}
            >
              {/* Question Header */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-1 text-xs font-bold text-white bg-blue-600 rounded">#{idx + 1}</span>
                  <select 
                    value={question.sensitivity}
                    onChange={(e) => updateQuestionField(question.question_id, 'sensitivity', e.target.value)}
                    className={`px-2 py-1 text-xs text-white rounded border-none focus:outline-none focus:ring-1 focus:ring-blue-400 ${
                      question.sensitivity === 'low' ? 'bg-green-600' :
                      question.sensitivity === 'medium' ? 'bg-yellow-600' : 'bg-red-600'
                    }`}
                    tabIndex={getTabIndex(idx, 'sensitivity')}
                  >
                    <option value="low">נמוך</option>
                    <option value="medium">בינוני</option>
                    <option value="high">גבוה</option>
                  </select>
                  <OnClickCopyToClipboard 
                    textToCopy={question.question_id}
                    className="px-2 py-1 text-xs text-gray-300 bg-gray-600 rounded hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-400"
                    title="העתק ID"
                  >
                    📋
                  </OnClickCopyToClipboard>
                </div>
                <button 
                  onClick={() => deleteQuestion(question.question_id)}
                  className="px-2 py-1 text-xs text-white bg-red-600 rounded hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-400"
                  tabIndex={getTabIndex(idx, 'delete')}
                >
                  🗑️
                </button>
              </div>

              {/* Sensitivity Description */}
              <div className="mb-3 text-xs text-gray-300">
                {SENSITIVITY_DESCRIPTIONS[question.sensitivity]}
              </div>

              {/* Question Text */}
              <div className="mb-3">
                <div className="flex items-center gap-3">
                  <label className="text-xs font-medium text-gray-400 min-w-[80px]">שאלה עצמית:</label>
                  <div className="flex-1">
                    {renderEditableField(question, 'question_text', question.question_text, 'הכנס שאלה...', idx, 'question_text')}
                  </div>
                </div>
              </div>

              {/* Questions about others */}
              <div className="mb-3 space-y-2">
                <div className="flex items-center gap-3">
                  <label className="text-xs font-medium text-gray-400 min-w-[80px]">שאלה על זכר:</label>
                  <div className="flex-1">
                    {renderEditableField(question, 'question_about_male', question.question_about_male || '', 'שאלה על זכר...', idx, 'question_about_male')}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <label className="text-xs font-medium text-gray-400 min-w-[80px]">שאלה על נקבה:</label>
                  <div className="flex-1">
                    {renderEditableField(question, 'question_about_female', question.question_about_female || '', 'שאלה על נקבה...', idx, 'question_about_female')}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <label className="text-xs font-medium text-gray-400 min-w-[80px]">רק טקסט חופשי</label>
                  <button 
                    onClick={() => cycleQuestionType(question.question_id)}
                    className={`px-2 py-1 text-xs rounded cursor-pointer hover:opacity-80 transition-opacity ${
                      question.question_type === 'free_form' 
                        ? 'bg-green-600 text-white' 
                        : ''
                    }`}
                    title="לחץ להחלפה"
                  >
                    רק טקסט חופשי
                  </button>
                  <button 
                    onClick={() => cycleQuestionType(question.question_id)}
                    className={`px-2 py-1 text-xs rounded cursor-pointer hover:opacity-80 transition-opacity ${
                      question.question_type === 'free_form' 
                        ? '' 
                        : 'bg-purple-600 text-white'
                    }`}
                    title="לחץ להחלפה"
                  >
                    בחירה מאפשרויות
                  </button>
                </div>
              </div>

              {/* Question Type & Settings */}
              {question.question_type=="choose_one" && <div className="flex items-center gap-4 mb-3">
                <div className="flex items-center gap-2">
                  <label className="text-xs font-medium text-gray-400">תשובות להצגה</label>
                  <input 
                    type="number" 
                    value={question.max_answers_to_show} 
                    onChange={(e) => updateQuestionField(question.question_id, 'maxAnswersToShow', parseInt(e.target.value))}
                    className="w-16 p-1 text-xs text-white bg-gray-700 border border-gray-600 rounded focus:outline-none focus:ring-1 focus:ring-blue-400"
                    min="1" 
                    max="20"
                    tabIndex={getTabIndex(idx, 'max_answers')}
                  />
                </div>
              
              </div>
              }

              {/* Answers/Options for all question types */}
                <div className="mb-3">
                  <div className="flex flex-wrap gap-1">
                    {question.answers?.map((answer, answerIdx) => (
                      <div key={answerIdx} className="flex items-center gap-1 px-2 py-1 bg-gray-700 rounded">
                        <input 
                          type="text" 
                          value={answer} 
                          onChange={(e) => updateAnswer(question.question_id, answerIdx, e.target.value)}
                          className="min-w-0 flex-1 text-xs text-white bg-transparent border-none outline-none"
                          style={{ 
                            direction: 'rtl', 
                            width: `${Math.max(40, answer.length * 7 + 16)}px` 
                          }}
                          placeholder={`${question.question_type === 'choose_one' ? 'תשובה' : 'אפשרות'} ${answerIdx + 1}`}
                          tabIndex={getTabIndex(idx, 'answer', answerIdx)}
                        />
                        <button 
                          onClick={() => removeAnswer(question.question_id, answerIdx)}
                          className="text-xs text-red-400 hover:text-red-300 focus:outline-none"
                          tabIndex={getTabIndex(idx, 'remove_answer', answerIdx)}
                          title={`מחק ${question.question_type === 'choose_one' ? 'תשובה' : 'אפשרות'} זו`}
                        >
                          ×
                        </button>
                        
                      </div>
                    ))}
                      <button 
                  onClick={() => addAnswer(question.question_id)}
                  className="px-2 py-1 text-xs text-white bg-green-600 rounded hover:bg-green-700 focus:outline-none focus:ring-1 focus:ring-green-400"
                  tabIndex={getTabIndex(idx, 'add_answer')}
                >
                  + תשובה
                </button>
                  </div>
                  
                  {question.question_type === 'choose_one' && (
                    <div className="mt-2">
                      <label className="inline-flex items-center text-xs cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={question.allow_other} 
                          onChange={(e) => updateQuestionField(question.question_id, 'allowOther', e.target.checked)}
                          className="ml-1 focus:ring-1 focus:ring-blue-400"
                          tabIndex={getTabIndex(idx, 'allow_other')}
                        />
                        <span>אפשרות "אחר"</span>
                      </label>
                    </div>
                  )}
                </div>
            </div>
          ))}
          
          {questions.length === 0 && (
            <div className="py-12 text-center">
              <p className="text-lg text-gray-400 mb-4">אין שאלות עדיין</p>
              <button 
                onClick={createNewQuestion}
                className="px-6 py-3 text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
                tabIndex={5}
              >
                צור את השאלה הראשונה
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
