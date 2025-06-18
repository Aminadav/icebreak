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

declare global {

  export type GAME_STATES= 
              gameStateEmptyGameState
            | gameStateBefore
            | gameState2
}
