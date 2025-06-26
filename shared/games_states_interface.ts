export var EMPTY_GAME_STATE:GAME_STATES={screenName:'EMPTY_GAME_STATE'};

type gameStateEmptyGameState ={
  screenName:'EMPTY_GAME_STATE', // just so it will not be null
}
type gameStateBefore ={
  screenName:'BEFORE_START_ABOUT_YOU',
}


type BASIC_QUESTION={
  question_id?:string,
  question_text:string,
  question_type:'free_form' | 'choose_one',
  sensitivity?:'low'|'medium'|'high',
  created_at?:string,
  updated_at?:string,  
  max_answers_to_show?:number
  
  // FREE FORM
  allow_other?:boolean,
  answers?:string[],
}

declare global {

  type gameStateTextMessageToUser ={
  screenName:'TEXT_MESSAGE_TO_USER',
  text: string,
  messageId: "TWO_MORE_QUESTIONS_ABOUT_YOU",
  image?: string,
}

  type gameStateAnswerFeedback = {
    screenName:'ANSWER_FEEDBACK',
    mainMessage: string,
    question: string,
    pointsReceived: number,
    correctStatus: "YOU_CORRECT" | "YOU_INCORRECT",
    answers: {
      text: string,
      isCorrect: boolean,
      howManyUsers: number
    }[]
  }

  type gameStatePleaseTakeAPicture ={
    screenName:'PLEASE_TAKE_A_PICTURE',
  }

  type GAME_STATE_QUESTION_ABOUT_OTHER ={
    screenName:'QUESTION_ABOUT_OTHER',
    question:QUESTION,
  }

  type GAME_STATE_QUESTION_ABOUT_MYSELF ={
    screenName:'QUESTION_ABOUT_MYSELF',
    isIntro?:boolean
    introCurrentQuestion?:number,
    introTotalQuestions?:number,
    question:QUESTION,
  }

  type GAME_STATE_GOT_POINTS = {
    screenName:'GOT_POINTS',
    points: number,
    text: string
  }

  type GAME_STATE_GOT_BADGE={
    screenName:'GOT_BADGE',
    badgeId:string,    
  }

  type ONE_BADGE={
    name:string,
    image:string,
    description:string,
    points:number,
    badgeId:string,
  }
  type gameStateCreatorFinishedOnboardingQuestions = {
    screenName: 'CREATOR_FINISHED_ONBOARDING_QUESTIONS'
  }

  type OTHER_SCREENS={
    screenName: 'GALLERY' 
              | "GIVE_GAME_NAME" 
              | "ASK_USER_PHONE" 
              | 'ASK_USER_VERIFICATION_CODE'
              | 'ASK_FOR_EMAIL'
              | 'ASK_PLAYER_NAME'
              | 'ASK_PLAYER_GENDER'
              | 'ASK_FOR_PICTURE'
              | 'CAMERA'
              | "CREATOR_GAME_READY"
  }

  export type GAME_STATES= 
              gameStateEmptyGameState
            | gameStateBefore
            | gameStateCreatorFinishedOnboardingQuestions
            | OTHER_SCREENS
            | gameStateTextMessageToUser
            | gameStateAnswerFeedback
            | gameStatePleaseTakeAPicture
            | GAME_STATE_QUESTION_ABOUT_MYSELF
            | GAME_STATE_QUESTION_ABOUT_OTHER
            | GAME_STATE_GOT_POINTS
            | GAME_STATE_GOT_BADGE;


  export type QUESTION=BASIC_QUESTION
}

