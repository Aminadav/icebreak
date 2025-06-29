import { useState, useEffect } from 'react';
import { useSocket } from '../contexts/SocketContext';
import { useGame } from '../contexts/GameContext';

export default function AdminPage(): JSX.Element {
  const { socket } = useSocket();
  const [currentState, setCurrentState] = useState<string>('INITIAL');
  const [selectedState, setSelectedState] = useState<string>('INITIAL');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<string>('');
  const [deviceInfo, setDeviceInfo] = useState<any>(null);
  const game=useGame();
  const gameId=game?.gameId


  // Set up socket event listeners
  useEffect(() => {
    if (!socket) return;

    const handleDeviceRegistered = (data: any) => {
      console.log('🔍 Admin: Device registered response:', data);
      setDeviceInfo(data);
      setIsLoading(false); // Reset loading state when device registration completes
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
    socket.on('admin_game_states_deleted', handleGameStatesDeleted);
    socket.on('admin_page_set', handlePageSet);
    socket.on('error', handleError);
    socket.on('admin_game_states_deleted', handleGameStatesDeleted);

    return () => {
      socket.off('device_registered', handleDeviceRegistered);
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

  };

  var sampleGameStates: Array<{ state: GAME_STATES, metadata?: any }> = [
    {
      state: {
        screenName: 'CREATOR_GAME_READY'
      },
    },
    {
      state: {
        screenName: 'BEFORE_START_ABOUT_YOU'
      },
    },
    {
      state: {
        screenName: 'CREATOR_FINISHED_ONBOARDING_QUESTIONS'
      },
    },
    {
      state: {
        screenName: 'GOT_POINTS',
        points: 10,
        text: 'כל הכבוד!'
      },
    },
    {
      state: {
        screenName: 'ASK_PLAYER_NAME',
      },
    },
    {
      state: {
        screenName: 'TEXT_MESSAGE_TO_USER',
        text: 'נשארו רק עוד 2 שאלות',
        messageId: 'TWO_MORE_QUESTIONS_ABOUT_YOU'
      },
    },
    {
      state: {
        screenName: 'PLEASE_TAKE_A_PICTURE'
      },
    },
    {
      state: {
        screenName: 'QUESTION_ABOUT_OTHER',
        question: {
          question_type: 'free_form',
          question_text: 'מה דעתך?',
          max_answers_to_show:4,
          answers: [
            'אפשרות א',
            'אפשרות ב',
            'אפשרות ג',
            'אפשרות ד',
            'אפשרות ה',
            'אפשרות ו',
            'אפשרות ז',
          ],
        },
        about_user: {
          user_id: 'user123',
          name: 'עמינדב',
          image: '0fefc0641d77036e053ffc654baba207'
        }
      },
    },
    {
      state: {
        screenName: 'QUESTION_ABOUT_MYSELF',
        question: {
          question_type: 'free_form',
          question_text: 'מה דעתך?',
        }
      },
    },
    {
      state: {
        screenName: 'QUESTION_ABOUT_MYSELF',
        question: {
          question_type: 'choose_one',
          question_text: 'כן או לא?',
          allow_other: false,
          answers: ['כן', 'לא'],
        }
      },
    },
    {
      state: {
        screenName: 'QUESTION_ABOUT_MYSELF',
        question: {
          question_type: 'choose_one',
          question_text: 'כן או לא או משהו אחר?',
          allow_other: true,
          answers: ['כן', 'לא'],
        }
      },
    },
    {
      state: {
        screenName: 'GOT_BADGE',
        badgeId: 'badge1',
        // friendsInLevel: []
      },
    },
    {
      state: {
        screenName: 'ANSWER_FEEDBACK',
        mainMessage: 'יפה מאוד',
        question: 'מה החג שלדעתך עמינדב הכי אוהב?',
        pointsReceived: 10,
        correctStatus: "YOU_CORRECT" as const,
        about_user: {
          user_id: 'user123',
          name: 'עמינדב',
          image: '0fefc0641d77036e053ffc654baba207'
        },
        answers: [
          {
            text: 'פסח',
            isCorrect: true,
            howManyUsers: 1
          },
          {
            text: 'שבועות',
            isCorrect: false,
            howManyUsers: 8
          },
          {
            text: 'סוכות',
            isCorrect: false,
            howManyUsers: 13
          },
          {
            text: 'פורים',
            isCorrect: false,
            howManyUsers: 25
          }
        ]
      },
    },
    {
      state: {
        screenName: 'GALLERY',
      }
    },
    {
      state: {
        screenName: 'ANSWER_FEEDBACK',
        mainMessage: 'טעות',
        question: 'מה החג שלדעתך עמינדב הכי אוהב?',
        pointsReceived: 1,
        correctStatus: "YOU_INCORRECT" as const,
        about_user: {
          user_id: 'user123',
          name: 'עמינדב',
          image: '0fefc0641d77036e053ffc654baba207'
        },
        answers: [
          {
            text: 'פסח',
            isCorrect: true,
            howManyUsers: 1
          },
          {
            text: 'שבועות',
            isCorrect: false,
            howManyUsers: 8
          },
          {
            text: 'סוכות',
            isCorrect: false,
            howManyUsers: 13
          },
          {
            text: 'פורים',
            isCorrect: false,
            howManyUsers: 25
          }
        ]
      },
    },
    {
      state: {
        screenName: 'NO_MORE_QUESTIONS'
      },
    }
  ]


  return (
    <div className="min-h-screen p-8 text-white bg-gray-900">
      <div className="max-w-4xl mx-auto">
        <h1 className="mb-8 text-3xl font-bold text-center">🔧 Admin - State Manager</h1>

        {/* State Selector */}
        <div className="p-6 mb-6 bg-gray-800 rounded-lg">

          {/* Status Message */}
          <div className={`${message ? '' : 'invisible'} rounded-lg p-4 mb-6 ${message.includes('Error') ? 'bg-red-900 border border-red-600' : 'bg-green-900 border border-green-600'
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
              >
                🗑️ Delete All Game States
              </button>
              <br />
              {sampleGameStates.map((item, idx) => (
                <div key={idx}>
                  <button
                    onClick={() => {
                      setMessage(`Done`);
                      socket.emit('admin-set-page', {
                        gameId,
                        gameState:item.state
                      });
                    }}
                    className="px-4 py-2 mt-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                  >
                    {JSON.stringify(item.state)} {item.metadata && `+ metadata: ${JSON.stringify(item.metadata)}`}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Questions Management Link */}
        <div className="p-6 mb-6 bg-gray-800 rounded-lg">
          <h2 className="mb-4 text-xl font-semibold">❓ ניהול שאלות</h2>
          <p className="mb-4 text-gray-300">עריכה וניהול של שאלות המשחק</p>
          <a 
            href="/admin/edit_questions"
            className="inline-block px-6 py-3 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
          >
            📝 עבור לעריכת שאלות
          </a>
        </div>
      </div>
    </div>
  );
}