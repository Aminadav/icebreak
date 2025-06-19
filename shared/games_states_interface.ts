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

  type GAME_STATE_QUESTION ={
    screenName:'QUESTION',
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
    friendsInLevel:{
      user_id:string,
      name:string,
      image:string
    }[]    
  }

  type ONE_BADGE={
    name:string,
    image:string,
    description:string,
    points:number,
    badgeId:string,
  }

  export type GAME_STATES= 
              gameStateEmptyGameState
            | gameStateBefore
            | gameStateTextMessageToUser
            | GAME_STATE_QUESTION
            | GAME_STATE_GOT_POINTS
            | GAME_STATE_GOT_BADGE;


  export type QUESTION=BASIC_QUESTION
}

