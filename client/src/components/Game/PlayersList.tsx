import React, { useEffect, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useGameStore } from '../../stores/gameStore';
import { socketService } from '../../services/socketService';
import { User, PaginatedResponse } from '../../types';

interface PlayersListProps {
  roomId: string;
}

const PlayersList: React.FC<PlayersListProps> = ({ roomId }) => {
  const { t } = useTranslation();
  const { players, setPlayers } = useGameStore();
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadPlayers = useCallback(async (page: number = 1, reset: boolean = false) => {
    if (page === 1) {
      setLoading(true);
    } else {
      setLoadingMore(true);
    }
    setError(null);

    try {
      socketService.getPlayers(roomId, page, 20);
      // Response will come through socket event
    } catch (error) {
      setError('שגיאה בטעינת השחקנים');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [roomId]);

  const loadMore = useCallback(() => {
    if (players && players.hasMore && !loadingMore) {
      const nextPage = Math.floor(players.data.length / 20) + 1;
      loadPlayers(nextPage);
    }
  }, [players, loadingMore, loadPlayers]);

  // Handle scroll for infinite loading
  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    const threshold = 100; // Load more when 100px from bottom

    if (scrollHeight - scrollTop - clientHeight < threshold) {
      loadMore();
    }
  }, [loadMore]);

  useEffect(() => {
    loadPlayers(1, true);
  }, [roomId]);

  if (loading) {
    return (
      <div className="card">
        <div className="card-body">
          <div className="flex items-center justify-center py-8">
            <div className="loading-spinner"></div>
            <span className="ml-2 rtl:mr-2">{t('ui.loading')}</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card">
        <div className="card-body">
          <div className="text-center py-8">
            <div className="text-4xl mb-4">❌</div>
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={() => loadPlayers(1, true)}
              className="btn-primary"
            >
              {t('ui.tryAgain')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!players || players.data.length === 0) {
    return (
      <div className="card">
        <div className="card-body">
          <div className="text-center py-8">
            <div className="text-4xl mb-4">👥</div>
            <p className="text-gray-600">אין שחקנים בחדר</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="card-header">
        <h3 className="text-lg font-semibold text-gray-900">
          שחקנים בחדר ({players.total})
        </h3>
      </div>
      <div 
        className="card-body max-h-96 overflow-y-auto custom-scrollbar"
        onScroll={handleScroll}
      >
        <div className="space-y-3">
          {players.data.map((player: User) => (
            <div
              key={player.id}
              className="flex items-center space-x-3 rtl:space-x-reverse p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                <span className="text-primary-600 font-semibold">
                  {player.name.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-900">{player.name}</p>
                <p className="text-sm text-gray-500">{player.email}</p>
              </div>
              <div className="text-xs text-gray-400">
                {new Date(player.createdAt).toLocaleDateString('he-IL')}
              </div>
            </div>
          ))}

          {/* Loading More Indicator */}
          {loadingMore && (
            <div className="flex items-center justify-center py-4">
              <div className="loading-spinner"></div>
              <span className="ml-2 rtl:mr-2 text-sm text-gray-500">
                {t('pagination.loadingMore')}
              </span>
            </div>
          )}

          {/* Load More Button */}
          {players.hasMore && !loadingMore && (
            <div className="text-center py-4">
              <button
                onClick={loadMore}
                className="btn-secondary"
              >
                {t('ui.loadMore')}
              </button>
            </div>
          )}

          {/* No More Items */}
          {!players.hasMore && players.data.length > 0 && (
            <div className="text-center py-4">
              <p className="text-sm text-gray-500">
                {t('pagination.noMoreItems')}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PlayersList;
