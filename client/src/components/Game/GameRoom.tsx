import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useGameStore } from '../../stores/gameStore';
import { useAuthStore } from '../../stores/authStore';
import { socketService } from '../../services/socketService';
import PlayersList from './PlayersList';
import QuestionsList from './QuestionsList';
import AddQuestion from './AddQuestion';

const GameRoom: React.FC = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { user } = useAuthStore();
  const { currentRoom, loading, error } = useGameStore();
  const [activeTab, setActiveTab] = useState<'players' | 'questions'>('players');
  const [showAddQuestion, setShowAddQuestion] = useState(false);

  const isHost = currentRoom?.hostId === user?.id;

  useEffect(() => {
    if (!roomId || !currentRoom || currentRoom.id !== roomId) {
      navigate('/');
    }
  }, [roomId, currentRoom, navigate]);

  const handleLeaveRoom = useCallback(() => {
    if (currentRoom) {
      socketService.leaveRoom(currentRoom.id);
      navigate('/');
    }
  }, [currentRoom, navigate]);

  const copyRoomCode = useCallback(async () => {
    if (currentRoom) {
      try {
        await navigator.clipboard.writeText(currentRoom.code);
        // TODO: Show success toast
      } catch (error) {
        console.error('Failed to copy room code:', error);
      }
    }
  }, [currentRoom]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="loading-spinner"></div>
        <span className="ml-2 rtl:mr-2">{t('ui.loading')}</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card max-w-2xl mx-auto">
        <div className="card-body text-center">
          <div className="text-6xl mb-4">❌</div>
          <h2 className="text-xl font-semibold text-red-600 mb-2">
            {t('ui.error')}
          </h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => navigate('/')}
            className="btn-primary"
          >
            חזור לעמוד הבית
          </button>
        </div>
      </div>
    );
  }

  if (!currentRoom) {
    return (
      <div className="card max-w-2xl mx-auto">
        <div className="card-body text-center">
          <div className="text-6xl mb-4">🔍</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            חדר לא נמצא
          </h2>
          <p className="text-gray-600 mb-4">
            החדר שחיפשתם לא נמצא או שאינכם חברים בו
          </p>
          <button
            onClick={() => navigate('/')}
            className="btn-primary"
          >
            חזור לעמוד הבית
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Room Header */}
      <div className="card">
        <div className="card-header">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {currentRoom.name}
              </h1>
              <div className="flex items-center space-x-4 rtl:space-x-reverse mt-2">
                <div className="flex items-center space-x-2 rtl:space-x-reverse">
                  <span className="text-sm text-gray-500">קוד חדר:</span>
                  <button
                    onClick={copyRoomCode}
                    className="font-mono text-lg font-bold text-primary-600 hover:text-primary-700 transition-colors"
                    title="לחץ להעתקה"
                  >
                    {currentRoom.code}
                  </button>
                </div>
                <div className="text-sm text-gray-500">
                  {currentRoom.players.length} / {currentRoom.maxPlayers} שחקנים
                </div>
                {isHost && (
                  <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full">
                    מנחה
                  </span>
                )}
              </div>
            </div>
            <button
              onClick={handleLeaveRoom}
              className="btn-secondary"
            >
              {t('game.leaveGame')}
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 rtl:space-x-reverse bg-gray-100 p-1 rounded-lg w-fit">
        <button
          onClick={() => setActiveTab('players')}
          className={`px-6 py-2 rounded-md font-medium transition-colors ${
            activeTab === 'players'
              ? 'bg-white text-primary-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          👥 {t('game.players')} ({currentRoom.players.length})
        </button>
        <button
          onClick={() => setActiveTab('questions')}
          className={`px-6 py-2 rounded-md font-medium transition-colors ${
            activeTab === 'questions'
              ? 'bg-white text-primary-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          ❓ {t('game.questions')} ({currentRoom.questions.length})
        </button>
      </div>

      {/* Tab Content */}
      <div className="space-y-6">
        {activeTab === 'players' && (
          <PlayersList roomId={currentRoom.id} />
        )}

        {activeTab === 'questions' && (
          <>
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">
                שאלות המשחק
              </h2>
              <button
                onClick={() => setShowAddQuestion(true)}
                className="btn-primary"
              >
                ➕ {t('game.addQuestion')}
              </button>
            </div>
            
            <QuestionsList roomId={currentRoom.id} />
            
            {showAddQuestion && (
              <AddQuestion
                roomId={currentRoom.id}
                onClose={() => setShowAddQuestion(false)}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default GameRoom;
