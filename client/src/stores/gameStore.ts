import { create } from 'zustand';
import { GameState, GameRoom, User, Question, GameAnswer, PaginatedResponse } from '../types';

interface GameStore extends GameState {
  setCurrentRoom: (room: GameRoom | null) => void;
  updateRoom: (room: GameRoom) => void;
  addPlayer: (player: User) => void;
  removePlayer: (playerId: string) => void;
  setPlayers: (players: PaginatedResponse<User>) => void;
  addQuestion: (question: Question) => void;
  addAnswer: (answer: GameAnswer) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearGame: () => void;
}

export const useGameStore = create<GameStore>((set, get) => ({
  currentRoom: null,
  players: null,
  questions: [],
  answers: [],
  loading: false,
  error: null,

  setCurrentRoom: (room) => {
    set({ 
      currentRoom: room,
      questions: room?.questions || [],
      error: null
    });
  },

  updateRoom: (room) => {
    set({ 
      currentRoom: room,
      questions: room.questions,
      error: null
    });
  },

  addPlayer: (player) => {
    const { currentRoom, players } = get();
    if (currentRoom) {
      // Check if player already exists
      const existingPlayer = currentRoom.players.find(p => p.id === player.id);
      if (!existingPlayer) {
        set({
          currentRoom: {
            ...currentRoom,
            players: [...currentRoom.players, player]
          }
        });
      }
    }

    // Update players pagination if exists
    if (players) {
      const existingInPage = players.data.find(p => p.id === player.id);
      if (!existingInPage) {
        set({
          players: {
            ...players,
            data: [...players.data, player],
            total: players.total + 1
          }
        });
      }
    }
  },

  removePlayer: (playerId) => {
    const { currentRoom, players } = get();
    if (currentRoom) {
      set({
        currentRoom: {
          ...currentRoom,
          players: currentRoom.players.filter(p => p.id !== playerId)
        }
      });
    }

    if (players) {
      set({
        players: {
          ...players,
          data: players.data.filter(p => p.id !== playerId),
          total: Math.max(0, players.total - 1)
        }
      });
    }
  },

  setPlayers: (players) => {
    set({ players });
  },

  addQuestion: (question) => {
    const { questions } = get();
    set({
      questions: [...questions, question].sort((a, b) => a.orderIndex - b.orderIndex)
    });
  },

  addAnswer: (answer) => {
    const { answers } = get();
    // Replace existing answer from same user for same question, or add new
    const filteredAnswers = answers.filter(
      a => !(a.userId === answer.userId && a.questionId === answer.questionId)
    );
    set({
      answers: [...filteredAnswers, answer]
    });
  },

  setLoading: (loading) => {
    set({ loading });
  },

  setError: (error) => {
    set({ error });
  },

  clearGame: () => {
    set({
      currentRoom: null,
      players: null,
      questions: [],
      answers: [],
      loading: false,
      error: null
    });
  }
}));
