import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { socketService } from '../../services/socketService';

const JoinRoom: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [roomCode, setRoomCode] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomCode.trim()) return;

    setLoading(true);
    try {
      socketService.joinRoom(roomCode.trim().toUpperCase());
      // The socket will emit roomUpdated event which will redirect us
    } catch (error) {
      console.error('Error joining room:', error);
      setLoading(false);
    }
  };

  const formatRoomCode = (value: string) => {
    // Remove non-alphanumeric characters and convert to uppercase
    return value.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().slice(0, 6);
  };

  const handleRoomCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatRoomCode(e.target.value);
    setRoomCode(formatted);
  };

  return (
    <div className="max-w-md mx-auto">
      <div className="card">
        <div className="card-header text-center">
          <h1 className="text-2xl font-bold text-gray-900">
            {t('game.joinRoom')}
          </h1>
          <p className="text-gray-600 mt-2">
            הצטרפו לחדר משחק קיים
          </p>
        </div>

        <div className="card-body">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="roomCode" className="block text-sm font-medium text-gray-700 mb-2">
                {t('game.roomCode')}
              </label>
              <input
                id="roomCode"
                type="text"
                required
                className="form-input text-center text-2xl font-mono tracking-widest"
                placeholder="ABC123"
                value={roomCode}
                onChange={handleRoomCodeChange}
                maxLength={6}
              />
              <p className="text-xs text-gray-500 mt-1 text-center">
                הכניסו את קוד החדר שקיבלתם מהמנחה
              </p>
            </div>

            <div className="flex space-x-4 rtl:space-x-reverse">
              <button
                type="submit"
                disabled={loading || roomCode.length < 3}
                className="btn-primary flex-1 flex justify-center items-center"
              >
                {loading ? (
                  <div className="loading-spinner"></div>
                ) : (
                  <>
                    🚪 {t('game.joinGame')}
                  </>
                )}
              </button>
              
              <button
                type="button"
                onClick={() => navigate('/')}
                className="btn-secondary flex-1"
              >
                {t('ui.cancel')}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Example */}
      <div className="mt-8 bg-gray-50 border border-gray-200 rounded-lg p-4">
        <h3 className="font-semibold text-gray-800 mb-2">📝 דוגמה:</h3>
        <p className="text-sm text-gray-600">
          קוד החדר הוא בדרך כלל 6 תווים באנגלית ומספרים, כמו: <span className="font-mono bg-gray-200 px-1 rounded">ABC123</span>
        </p>
      </div>

      {/* Tips */}
      <div className="mt-4 bg-green-50 border border-green-200 rounded-lg p-4">
        <h3 className="font-semibold text-green-800 mb-2">💡 טיפים:</h3>
        <ul className="text-sm text-green-700 space-y-1">
          <li>• ודאו שקוד החדר נכון ופעיל</li>
          <li>• קוד החדר אינו תלוי ברישיות</li>
          <li>• אם החדר מלא, תקבלו הודעה מתאימה</li>
        </ul>
      </div>
    </div>
  );
};

export default JoinRoom;
