import { useState, useEffect } from 'react';
import { useSocket } from '../contexts/SocketContext';

const SENSITIVITY_DESCRIPTIONS: Record<string, string> = {
  low: 'נמוך - אפשר לספר לכל אחד, כמו נהג אוטובוס. (לדוג׳: האם אתה מעדיף מיץ תפוזים או מיץ תפוחים?)',
  medium: 'בינוני - למישהו שמכירים ומרגישים איתו בנוח. (לדוג׳: איפה אתה גר?)',
  high: 'גבוה - למישהו שסומכים עליו ויש קשר טוב. (לדוג׳: מה החלומות שלך? מה הכישלונות שלך?)',
};

export default function AdminPage(): JSX.Element {
  const { socket } = useSocket();
  const [currentState, setCurrentState] = useState<string>('INITIAL');
  const [selectedState, setSelectedState] = useState<string>('INITIAL');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<string>('');
  const [deviceInfo, setDeviceInfo] = useState<any>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [editingQuestion, setEditingQuestion] = useState<any | null>(null);
  const [questionForm, setQuestionForm] = useState<any>({
    questionText: '',
    questionType: 'free_form',
    answers: [],
    allowOther: false,
    sensitivity: 'low',
    maxAnswersToShow: 4,
  });
  const [questionLoading, setQuestionLoading] = useState(false);


  // Set up socket event listeners
  useEffect(() => {
    if (!socket) return;

    const handleDeviceRegistered = (data: any) => {
      console.log('🔍 Admin: Device registered response:', data);
      setCurrentState(data.journeyState || 'INITIAL');
      setSelectedState(data.journeyState || 'INITIAL');
      setDeviceInfo(data);
      setIsLoading(false); // Reset loading state when device registration completes
    };

    const handleJourneyStateUpdated = (data: { journeyState: string; success: boolean; message: string }) => {
      console.log('✅ Admin: Journey state updated:', data);
      setIsLoading(false);
      if (data.success) {
        setCurrentState(data.journeyState);
        setSelectedState(data.journeyState);
        setMessage(`✅ Success: ${data.message}`);
        // Clear success message after 3 seconds
        setTimeout(() => setMessage(''), 4000);
      }
    };

    const handleError = (data: { message: string }) => {
      console.error('❌ Admin: Socket error:', data);
      setIsLoading(false);
      setMessage(`❌ Error: ${data.message}`);
    };

    const handleGameStatesDeleted = (data: { success: boolean; message: string; deletedCount: number }) => {
      console.log('🗑️ Admin: Game states deleted response:', data);
      if (data.success) {
        setMessage(`✅ Success: ${data.message}`);
        // Clear success message after 4 seconds
        setTimeout(() => setMessage(''), 4000);
      }
    };

    const handlePageSet = (data: { success: boolean; message: string; updatedCount: number }) => {
      console.log('⭐ Admin: Page set response:', data);
      if (data.success) {
        setMessage(`✅ Success: ${data.message}`);
        // Clear success message after 4 seconds
        setTimeout(() => setMessage(''), 4000);
      }
    };

    socket.on('device_registered', handleDeviceRegistered);
    socket.on('journey_state_updated', handleJourneyStateUpdated);
    socket.on('admin_game_states_deleted', handleGameStatesDeleted);
    socket.on('admin_page_set', handlePageSet);
    socket.on('error', handleError);
    socket.on('admin_game_states_deleted', handleGameStatesDeleted);

    return () => {
      socket.off('device_registered', handleDeviceRegistered);
      socket.off('journey_state_updated', handleJourneyStateUpdated);
      socket.off('admin_game_states_deleted', handleGameStatesDeleted);
      socket.off('admin_page_set', handlePageSet);
      socket.off('error', handleError);
    };
  }, [socket]);

  // Initial device registration to get current state
  useEffect(() => {
    if (socket) {
      console.log('Admin: Auto device registration handled by SocketContext');
    }
  }, [socket]);

  const handleUpdateState = (newState?: string) => {
    const stateToUpdate = newState || selectedState;
    if (!socket || !stateToUpdate) {
      setMessage('❌ Error: No socket connection or state selected');
      return;
    }

    setIsLoading(true);
    setMessage('');
    
    console.log('🎯 Admin: Updating journey state to:', stateToUpdate);
  };


  // Socket listeners for questions
  useEffect(() => {
    if (!socket) return;
    const handleQuestionsList = (data: any) => {
      setQuestions(data.questions || []);
    };
    const handleQuestionCreated = (data: any) => {
      setQuestions((prev) => [...prev, data.question]);
      setMessage('✅ שאלה נוספה בהצלחה');
      setQuestionForm({ questionText: '', questionType: 'free_form', answers: [], allowOther: false, sensitivity: 'low', maxAnswersToShow: 4 });
      setEditingQuestion(null);
      setQuestionLoading(false);
    };
    const handleQuestionUpdated = (data: any) => {
      setQuestions((prev) => prev.map(q => q.question_id === data.question.question_id ? data.question : q));
      setMessage('✅ שאלה עודכנה בהצלחה');
      setEditingQuestion(null);
      setQuestionForm({ questionText: '', questionType: 'free_form', answers: [], allowOther: false, sensitivity: 'low', maxAnswersToShow: 4 });
      setQuestionLoading(false);
    };
    const handleQuestionDeleted = (data: any) => {
      setQuestions((prev) => prev.filter(q => q.question_id !== data.questionId));
      setMessage('🗑️ שאלה נמחקה');
      setQuestionLoading(false);
    };
    const handleError = (data: any) => {
      setMessage(`❌ שגיאה: ${data.message}`);
      setQuestionLoading(false);
    };
    socket.on('questions_list', handleQuestionsList);
    socket.on('question_created', handleQuestionCreated);
    socket.on('question_updated', handleQuestionUpdated);
    socket.on('question_deleted', handleQuestionDeleted);
    socket.on('error', handleError);
    // Fetch questions on mount
    socket.emit('get_questions');
    return () => {
      socket.off('questions_list', handleQuestionsList);
      socket.off('question_created', handleQuestionCreated);
      socket.off('question_updated', handleQuestionUpdated);
      socket.off('question_deleted', handleQuestionDeleted);
      socket.off('error', handleError);
    };
  }, [socket]);

  // Questions CRUD handlers
  const handleEditQuestion = (q: any) => {
    setEditingQuestion(q);
    setQuestionForm({
      questionText: q.question_text,
      questionType: q.question_type,
      answers: q.answers && Array.isArray(q.answers) ? q.answers : (q.answers ? [] : []),
      allowOther: q.allow_other,
      sensitivity: q.sensitivity,
      maxAnswersToShow: q.max_answers_to_show || 4,
      questionId: q.question_id,
    });
  };
  const handleDeleteQuestion = (questionId: string) => {
    if (!socket) return;
    setQuestionLoading(true);
    socket.emit('delete_question', { questionId });
  };
  const handleQuestionFormChange = (e: any) => {
    const { name, value, type, checked } = e.target;
    setQuestionForm((prev: any) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };
  const handleAnswersChange = (idx: number, value: string) => {
    setQuestionForm((prev: any) => {
      const answers = [...prev.answers];
      answers[idx] = value;
      return { ...prev, answers };
    });
  };
  const handleAddAnswer = () => {
    setQuestionForm((prev: any) => ({ ...prev, answers: [...prev.answers, ''] }));
  };
  const handleRemoveAnswer = (idx: number) => {
    setQuestionForm((prev: any) => {
      const answers = [...prev.answers];
      answers.splice(idx, 1);
      return { ...prev, answers };
    });
  };
  const handleQuestionFormSubmit = (e: any) => {
    e.preventDefault();
    if (!socket) return;
    setQuestionLoading(true);
    const payload = {
      ...questionForm,
      answers: questionForm.questionType === 'choose_one' ? questionForm.answers : [],
      allowOther: questionForm.questionType === 'choose_one' ? questionForm.allowOther : false,
      questionId: editingQuestion?.question_id,
    };
    socket.emit('save_question', payload);
  };
  const handleCancelEdit = () => {
    setEditingQuestion(null);
    setQuestionForm({ questionText: '', questionType: 'free_form', answers: [], allowOther: false, sensitivity: 'low', maxAnswersToShow: 4 });
  };

  var sampleGameStates:GAME_STATES[]=
    [
      {screenName:'GOT_POINTS',
            points: 10,
            text: 'כל הכבוד!'
          },
      {
        screenName:'TEXT_MESSAGE_TO_USER',
        text: 'נשארו רק עוד 2 שאלות',
        messageId: 'TWO_MORE_QUESTIONS_ABOUT_YOU'
      },
      {
        screenName:'PLEASE_TAKE_A_PICTURE'
      },
     {
      screenName:'QUESTION',
      question:{
        question_type:'free_form',
        question_text:'מה דעתך?',
      }
    },
    {
       screenName:'QUESTION',
       question:{
         question_type:'choose_one',
         question_text:'כן או לא?',
         allow_other:false,
         answers:['כן', 'לא'],
        }
      },
      {
       screenName:'QUESTION',
      question:{
       question_type:'choose_one',
       question_text:'כן או לא או משהו אחר?',
       allow_other:true,
       answers:['כן', 'לא'],
      }
     },
      {
       screenName:'GOT_BADGE',
       badgeId:'badge1',
       friendsInLevel:[]
     }
   ]
  

  return (
    <div className="min-h-screen p-8 text-white bg-gray-900">
      <div className="max-w-4xl mx-auto">
        <h1 className="mb-8 text-3xl font-bold text-center">🔧 Admin - Journey State Manager</h1>
        
        {/* State Selector */}
        <div className="p-6 mb-6 bg-gray-800 rounded-lg">

        {/* Status Message */}
        <div className={`${message ? '' : 'invisible'} rounded-lg p-4 mb-6 ${
          message.includes('Error') ? 'bg-red-900 border border-red-600' : 'bg-green-900 border border-green-600'
        }`}>
          <div className="font-medium">{message}&nbsp;</div>
        </div>


        {/* Device Info */}
        <div className="p-6 mb-6 bg-gray-800 rounded-lg">
          <h2 className="mb-4 text-xl font-semibold">📱 Device Information</h2>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div><strong>Device ID:</strong> Auto-managed</div>
            <div><strong>User ID:</strong> {deviceInfo?.userId || 'None'}</div>
            <div><strong>Verified:</strong> {deviceInfo?.isVerified ? 'Yes' : 'No'}</div>
            <div><strong>Phone:</strong> {deviceInfo?.phoneNumber || 'Not set'}</div>
            <div><strong>Email:</strong> {deviceInfo?.email || 'Not set'}</div>
            <div><strong>Name:</strong> {deviceInfo?.name || 'Not set'}</div>
            <div><strong>Gender:</strong> {deviceInfo?.gender || 'Not set'}</div>
          </div>
          
          {/* Admin Actions */}
          <div className="pt-4 mt-4 border-t border-gray-700">
            <h3 className="mb-2 text-lg font-semibold">🔧 Admin Actions</h3>
            <button
              onClick={() => {
                setMessage('🗑️ Deleting all game states...');
                socket.emit('admin-delete-my-game-states');
              }}
              className="px-4 py-2 text-white bg-red-600 rounded-lg hover:bg-red-700"
              disabled={!deviceInfo?.userId}
            >
              🗑️ Delete All Game States
            </button>
            {sampleGameStates.map((q, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setMessage(`Done`);
                  socket.emit('admin-set-page', q);
                }}
                className="px-4 py-2 mt-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                disabled={!deviceInfo?.userId}
              >
                {JSON.stringify(q)}
              </button>
            ))}
          </div>
        </div>
      </div>

        {/* Questions Management */}
        <div className="p-6 mb-6 bg-gray-800 rounded-lg">
          <h2 className="mb-4 text-xl font-semibold">❓ ניהול שאלות</h2>
          <div className="mb-4 text-sm text-gray-300">
            <strong>דרגת רגישות (עברית):</strong>
            <ul className="ml-6 list-disc">
              <li><strong>נמוך:</strong> {SENSITIVITY_DESCRIPTIONS.low}</li>
              <li><strong>בינוני:</strong> {SENSITIVITY_DESCRIPTIONS.medium}</li>
              <li><strong>גבוה:</strong> {SENSITIVITY_DESCRIPTIONS.high}</li>
            </ul>
          </div>
          {/* Questions List */}
          <table className="w-full mb-6 text-sm bg-gray-900 rounded-lg">
            <thead>
              <tr className="bg-gray-700">
                <th className="p-2">#</th>
                <th className="p-2">שאלה</th>
                <th className="p-2">סוג</th>
                <th className="p-2">תשובות</th>
                <th className="p-2">רגישות</th>
                <th className="p-2">מקס׳ תשובות</th>
                <th className="p-2">פעולות</th>
              </tr>
            </thead>
            <tbody>
              {questions.map((q, idx) => (
                <tr key={q.question_id} className="border-b border-gray-700">
                  <td className="p-2">{idx + 1}</td>
                  <td className="p-2">{q.question_text}</td>
                  <td className="p-2">{q.question_type === 'free_form' ? 'שאלה פתוחה' : 'בחירה'}</td>
                  <td className="p-2">
                    {q.question_type === 'choose_one' && q.answers ? (
                      <ul className="ml-4 list-disc">
                        {(Array.isArray(q.answers) ? q.answers : []).map((a: string, i: number) => <li key={i}>{a}</li>)}
                        {q.allow_other && <li><em>אפשרות אחרת (טקסט חופשי)</em></li>}
                      </ul>
                    ) : '-'}
                  </td>
                  <td className="p-2">{q.sensitivity}</td>
                  <td className="p-2">{q.max_answers_to_show || 4}</td>
                  <td className="p-2">
                    <button className="px-2 py-1 mr-2 text-xs bg-blue-700 rounded" onClick={() => handleEditQuestion(q)}>ערוך</button>
                    <button className="px-2 py-1 text-xs bg-red-700 rounded" onClick={() => handleDeleteQuestion(q.question_id)}>מחק</button>
                  </td>
                </tr>
              ))}
              {questions.length === 0 && (
                <tr><td colSpan={7} className="p-2 text-center text-gray-400">אין שאלות</td></tr>
              )}
            </tbody>
          </table>
          {/* Add/Edit Question Form */}
          <form onSubmit={handleQuestionFormSubmit} className="p-4 bg-gray-900 rounded-lg">
            <h3 className="mb-2 text-lg font-semibold">{editingQuestion ? 'עריכת שאלה' : 'הוספת שאלה חדשה'}</h3>
            <div className="mb-2">
              <label className="block mb-1">שאלה</label>
              <input type="text" name="questionText" value={questionForm.questionText} onChange={handleQuestionFormChange} className="w-full p-2 text-white bg-gray-800 rounded" required />
            </div>
            <div className="mb-2">
              <label className="block mb-1">סוג שאלה</label>
              <select name="questionType" value={questionForm.questionType} onChange={handleQuestionFormChange} className="w-full p-2 text-white bg-gray-800 rounded">
                <option value="free_form">שאלה פתוחה</option>
                <option value="choose_one">בחירה</option>
              </select>
            </div>
            {questionForm.questionType === 'choose_one' && (
              <div className="mb-2">
                <label className="block mb-1">תשובות אפשריות</label>
                {questionForm.answers.map((a: string, idx: number) => (
                  <div key={idx} className="flex mb-1">
                    <input type="text" value={a} onChange={e => handleAnswersChange(idx, e.target.value)} className="flex-1 p-2 text-white bg-gray-800 rounded" required />
                    <button type="button" className="px-2 py-1 ml-2 bg-red-700 rounded" onClick={() => handleRemoveAnswer(idx)}>X</button>
                  </div>
                ))}
                <button type="button" className="px-2 py-1 bg-green-700 rounded" onClick={handleAddAnswer}>הוסף תשובה</button>
                <div className="mt-2">
                  <label className="inline-flex items-center">
                    <input type="checkbox" name="allowOther" checked={questionForm.allowOther} onChange={handleQuestionFormChange} className="ml-2" />
                    אפשרות אחרת (טקסט חופשי)
                  </label>
                </div>
              </div>
            )}
            <div className="mb-2">
              <label className="block mb-1">דרגת רגישות</label>
              <select name="sensitivity" value={questionForm.sensitivity} onChange={handleQuestionFormChange} className="w-full p-2 text-white bg-gray-800 rounded">
                <option value="low">נמוך</option>
                <option value="medium">בינוני</option>
                <option value="high">גבוה</option>
              </select>
            </div>
            <div className="mb-2">
              <label className="block mb-1">מספר תשובות מקסימלי להצגה</label>
              <input type="number" name="maxAnswersToShow" value={questionForm.maxAnswersToShow} onChange={handleQuestionFormChange} className="w-full p-2 text-white bg-gray-800 rounded" min="1" max="20" />
            </div>
            <div className="flex gap-2 mt-4">
              <button type="submit" className="px-4 py-2 text-white bg-blue-700 rounded" disabled={questionLoading}>{editingQuestion ? 'עדכן' : 'הוסף'}</button>
              {editingQuestion && <button type="button" className="px-4 py-2 text-white bg-gray-600 rounded" onClick={handleCancelEdit}>ביטול</button>}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}