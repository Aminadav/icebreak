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
import TextMessageToUserPage from './TextMessageToUserPage';
import AnswerFeedbackPage from './AnswerFeedbackPage';
import PleaseTakeAPicturePage from './PleaseTakeAPicturePage';
import QuestionPage from './QuestionPage';
import GotPointsPage from './GotPointsPage';
import GotBadgePage from './GotBadgePage';

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
    return <div></div>
  }
  if(gameState.screenName=="BEFORE_START_ABOUT_YOU") {
    return <BeforeStartAskAboutYou gameState={gameState}/>
  }
  if(gameState.screenName=="TEXT_MESSAGE_TO_USER") {
    return <TextMessageToUserPage gameState={gameState}/>
  }
  if(gameState.screenName=="ANSWER_FEEDBACK") {
    return <AnswerFeedbackPage gameState={gameState}/>
  }
  if(gameState.screenName=="PLEASE_TAKE_A_PICTURE") {
    return <PleaseTakeAPicturePage gameState={gameState}/>
  }
  if(gameState.screenName=="QUESTION") {
    return <QuestionPage gameState={gameState} />
  }
  if(gameState.screenName=="GOT_POINTS") {
    return <GotPointsPage gameState={gameState} />
  }
  if(gameState.screenName=="GOT_BADGE") {
    return <GotBadgePage  gameState={gameState} />
  }
  return <div>{JSON.stringify(gameState)}</div>;
}
