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
  type GAME_STATE_QUESTION ={
    screenName:'QUESTION',
    isIntro:boolean
    introCurrentQuestion:number,
    introTotalQuestions:number,
    question:QUESTION,
  }

  export type GAME_STATES= 
              gameStateEmptyGameState
            | gameStateBefore
            | GAME_STATE_QUESTION


  export type QUESTION=BASIC_QUESTION
}

