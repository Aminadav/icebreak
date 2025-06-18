import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageLayout from '../components/PageLayout';
import Button from '../components/Button';
import AnimatedImage from '../components/AnimatedImage';
import MyPoints from '../components/MyPoints';
import { useSocket } from '../contexts/SocketContext';
import { useGameId } from '../utils/useGameId';
import { usePoints } from '../contexts/GameContext';
import { EMPTY_GAME_STATE } from '../../../shared/games_states_interface';
import BeforeStartAskAboutYou from './BeforeStartAskAboutYou';

export default function Play(): JSX.Element {
  const navigate = useNavigate();
  const gameId = useGameId();
  const { points } = usePoints();
  const {socket}=useSocket();
  const [gameState, setGameState] = useState<GAME_STATES>(EMPTY_GAME_STATE);

  useEffect(() => {
    if(!socket) return console.error('socket not found')
    function onUpdateGameState(gameState:GAME_STATES) {
      setGameState(gameState);
    }
    socket.on('update-game-state', onUpdateGameState)
    socket.emit('get-game-state',{gameId})
    return ()=>{
      socket.off('update-game-state', onUpdateGameState);
    }
  }, []);
  
  if(gameState.screenName=="EMPTY_GAME_STATE") {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <div className="text-xl text-red-400">Empty game state</div>
      </div>
    );
  }
  if(gameState.screenName=="BEFORE_START_ABOUT_YOU") {
    return <BeforeStartAskAboutYou gameState={gameState}/>
  }
  return <div>טוען...</div>;
}
