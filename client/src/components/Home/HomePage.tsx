import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../../stores/authStore';
import { useGameStore } from '../../stores/gameStore';

const HomePage: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuthStore();
  const { currentRoom } = useGameStore();

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          {t('nav.welcome')}, {user?.name}! 👋
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          ברוכים הבאים למשחק שבירת הקרח! צרו חדר משחק חדש או הצטרפו לחדר קיים כדי להתחיל לשחק.
        </p>
      </div>

      {/* Current Room */}
      {currentRoom && (
        <div className="card max-w-2xl mx-auto">
          <div className="card-header">
            <h2 className="text-xl font-semibold text-gray-900">
              החדר הנוכחי שלך
            </h2>
          </div>
          <div className="card-body">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium text-gray-900">{currentRoom.name}</h3>
                <p className="text-sm text-gray-500">קוד חדר: {currentRoom.code}</p>
                <p className="text-sm text-gray-500">
                  {currentRoom.players.length} מתוך {currentRoom.maxPlayers} שחקנים
                </p>
              </div>
              <Link
                to={`/room/${currentRoom.id}`}
                className="btn-primary"
              >
                חזור לחדר
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Action Cards */}
      <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        {/* Create Room Card */}
        <div className="card hover:shadow-xl transition-shadow duration-300">
          <div className="card-body text-center py-12">
            <div className="text-6xl mb-6">🎮</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              {t('game.createRoom')}
            </h2>
            <p className="text-gray-600 mb-8">
              צרו חדר משחק חדש והזמינו חברים להצטרף אליכם
            </p>
            <Link
              to="/create-room"
              className="btn-primary text-lg px-8 py-3"
            >
              {t('game.createRoom')}
            </Link>
          </div>
        </div>

        {/* Join Room Card */}
        <div className="card hover:shadow-xl transition-shadow duration-300">
          <div className="card-body text-center py-12">
            <div className="text-6xl mb-6">🚪</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              {t('game.joinRoom')}
            </h2>
            <p className="text-gray-600 mb-8">
              הצטרפו לחדר משחק קיים באמצעות קוד החדר
            </p>
            <Link
              to="/join-room"
              className="btn-secondary text-lg px-8 py-3"
            >
              {t('game.joinRoom')}
            </Link>
          </div>
        </div>
      </div>

      {/* How to Play */}
      <div className="card max-w-4xl mx-auto">
        <div className="card-header">
          <h2 className="text-2xl font-bold text-gray-900">איך לשחק?</h2>
        </div>
        <div className="card-body">
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-4xl mb-4">1️⃣</div>
              <h3 className="text-lg font-semibold mb-2">צרו או הצטרפו לחדר</h3>
              <p className="text-gray-600">התחילו על ידי יצירת חדר חדש או הצטרפות לחדר קיים</p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-4">2️⃣</div>
              <h3 className="text-lg font-semibold mb-2">הוסיפו שאלות</h3>
              <p className="text-gray-600">כל שחקן יכול להוסיף שאלות מעניינות לשבירת הקרח</p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-4">3️⃣</div>
              <h3 className="text-lg font-semibold mb-2">ענו על השאלות</h3>
              <p className="text-gray-600">ענו על השאלות וגלו דברים מעניינים על השחקנים האחרים</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
