export var EMPTY_GAME_STATE:GAME_STATES={screenName:'EMPTY_GAME_STATE'};

type gameStateEmptyGameState ={
  screenName:'EMPTY_GAME_STATE', // just so it will not be null
}
type gameStateBefore ={
  screenName:'BEFORE_START_ABOUT_YOU',
}
type gameState2 ={
  screenName:'2',
  b:string
}

type BASIC_QUESTION={
  question_id:string,
  question_text:string,
  answers:string[],
  allow_other:boolean,
  sensitivity:'low'|'medium'|'high',
  created_at:string,
  updated_at:string,
  question_type:'free_form'
}

declare global {

  export type GAME_STATES= 
              gameStateEmptyGameState
            | gameStateBefore
            | gameState2


  export type QUESTION=BASIC_QUESTION
}

