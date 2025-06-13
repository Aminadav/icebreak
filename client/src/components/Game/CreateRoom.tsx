import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { socketService } from '../../services/socketService';

const CreateRoom: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [roomName, setRoomName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomName.trim()) return;

    setLoading(true);
    try {
      socketService.createRoom(roomName.trim());
      // The socket will emit roomUpdated event which will redirect us
    } catch (error) {
      console.error('Error creating room:', error);
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <div className="card">
        <div className="card-header text-center">
          <h1 className="text-2xl font-bold text-gray-900">
            {t('game.createRoom')}
          </h1>
          <p className="text-gray-600 mt-2">
            צרו חדר משחק חדש והזמינו חברים
          </p>
        </div>

        <div className="card-body">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="roomName" className="block text-sm font-medium text-gray-700 mb-2">
                {t('game.roomName')}
              </label>
              <input
                id="roomName"
                type="text"
                required
                className="form-input"
                placeholder="הכניסו שם לחדר..."
                value={roomName}
                onChange={(e) => setRoomName(e.target.value)}
                maxLength={50}
              />
              <p className="text-xs text-gray-500 mt-1">
                השם יהיה גלוי לכל השחקנים בחדר
              </p>
            </div>

            <div className="flex space-x-4 rtl:space-x-reverse">
              <button
                type="submit"
                disabled={loading || !roomName.trim()}
                className="btn-primary flex-1 flex justify-center items-center"
              >
                {loading ? (
                  <div className="loading-spinner"></div>
                ) : (
                  <>
                    🎮 {t('game.createRoom')}
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

      {/* Tips */}
      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-semibold text-blue-800 mb-2">💡 טיפים:</h3>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• בחרו שם ברור וקצר לחדר</li>
          <li>• תקבלו קוד חדר ייחודי לשיתוף עם חברים</li>
          <li>• תוכלו להוסיף עד 10 שחקנים בחדר</li>
          <li>• כמנחה, תוכלו לנהל את השאלות והמשחק</li>
        </ul>
      </div>
    </div>
  );
};

export default CreateRoom;
