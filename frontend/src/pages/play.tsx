import { useEffect, useState } from 'react';
import { useSocket } from '../contexts/SocketContext';
import { useGameId } from '../utils/useGameId';
import { EMPTY_GAME_STATE } from '../../../shared/games_states_interface';
import BeforeStartAskAboutYou from './BeforeStartAskAboutYou';
import TextMessageToUserPage from './TextMessageToUserPage';
import AnswerFeedbackPage from './AnswerFeedbackPage';
import PleaseTakeAPicturePage from './PleaseTakeAPicturePage';
import QuestionAboutYourSelfPage from './QuestionPageAboutMyself';
import GotPointsPage from './GotPointsPage';
import GotBadgePage from './GotBadgePage';
import ImageGalleryPage from './ImageGalleryPage';
import GiveGameNamePage from './GiveGameNamePage';
import EnterPhoneNumberPage from './EnterPhoneNumberPage';
import Enter2faCodePage from './Enter2faCodePage';
import EnterEmailPage from './EnterEmailPage';
import EnterNamePage from './EnterNamePage';
import SelectGenderPage from './SelectGenderPage';
import PictureUploadPage from './PictureUploadPage';
import CameraPage from './CameraPage';
import CreatorGameReadyPage from './CreatorGameReadyPage';
import CreatorFinishedOnboardingQuestionsPage from './CreatorFinishedOnboardingQuestionsPage';
import QuestionAboutOtherPage from './QuestionPageAboutOther';
import { getIsTesting } from '../utils/isTesting';
import { env } from '../env';

export default function Play(): JSX.Element {
  const gameId = useGameId();
  const {socket}=useSocket();
  const [gameState, setGameState] = useState<GAME_STATES>(EMPTY_GAME_STATE);
  const [isShiftPressed, setIsShiftPressed] = useState(false);

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
  useEffect(() => {
    if (!env.is_dev) return;
    function handle(event: KeyboardEvent) {
      if (event.key === 'Shift') {
        setIsShiftPressed(x=>!x);
      }
    };
    window.addEventListener('keydown', handle);
    return () => {
      window.removeEventListener('keydown', handle);
    };
  }, []);
  
  return (
    <div>
      {gameState.screenName=="GIVE_GAME_NAME" && 
        <GiveGameNamePage/>
      }
      {gameState.screenName=="ASK_USER_PHONE" && 
        <EnterPhoneNumberPage/>
      }
      {gameState.screenName=='ASK_USER_VERIFICATION_CODE' &&
      <Enter2faCodePage/>
      }
      { gameState.screenName=="ASK_FOR_EMAIL" &&
        <EnterEmailPage/>
      }
      {gameState.screenName=="ASK_PLAYER_NAME" &&
        <EnterNamePage/>
      }
      {gameState.screenName=="ASK_PLAYER_GENDER" &&
        <SelectGenderPage/>
      }
      {gameState.screenName=="ASK_FOR_PICTURE" &&
      <PictureUploadPage/>
      }
      {gameState.screenName=="CAMERA" && 
        <CameraPage/>
      }
      {gameState.screenName=="GALLERY" && 
        <ImageGalleryPage/>
      }
      
      {gameState.screenName=="CREATOR_GAME_READY" && 
        <CreatorGameReadyPage/>
      }
      
      {gameState.screenName=="CREATOR_FINISHED_ONBOARDING_QUESTIONS" && 
        <CreatorFinishedOnboardingQuestionsPage/>
      }
      
      {gameState.screenName=="BEFORE_START_ABOUT_YOU" && 
        <BeforeStartAskAboutYou gameState={gameState}/>
      }
      {gameState.screenName=="TEXT_MESSAGE_TO_USER" && 
        <TextMessageToUserPage gameState={gameState}/>
      }
      {gameState.screenName=="ANSWER_FEEDBACK" && 
        <AnswerFeedbackPage gameState={gameState}/>
      }
      {gameState.screenName=="PLEASE_TAKE_A_PICTURE" && 
        <PleaseTakeAPicturePage gameState={gameState}/>
      }
      {gameState.screenName=="QUESTION_ABOUT_MYSELF" && 
        <QuestionAboutYourSelfPage gameState={gameState} />
      }
      {gameState.screenName=="QUESTION_ABOUT_OTHER" && 
        <QuestionAboutOtherPage gameState={gameState} />
      }
      {gameState.screenName=="GOT_POINTS" && 
        <GotPointsPage gameState={gameState} />
      }
      {gameState.screenName=="GOT_BADGE" && 
        <GotBadgePage gameState={gameState} />
      }
      {JSON.stringify({isShiftPressed})}
        {(env.DEBUG_SHOW_SCREEN_NAME || (env.is_dev && isShiftPressed)) && <div dir="ltr"style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        border: '1px solid red',
        backgroundColor: 'white',
        padding: '10px',
        textAlign: 'center',
        zIndex: 10,
      }}>
        {JSON.stringify(gameState,null,2)}
        </div>}
    </div>
  );
}
