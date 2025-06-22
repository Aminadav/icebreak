/**
 * @type {rule[]}
 */
var rules=[
  {
      // "questionAboutYou":0,
      // nextScreen:'enter-your-name',
      hasSeenInto:false,
      nextScreen:{
        screenName:'BEFORE_START_ABOUT_YOU',        
      }
  },
  {
    // nextScreen:'enter-your-name',
    isCorrect:0,
    hasSeenInto:true,
      nextScreen:{
        screenName:'ANSWER_FEEDBACK',
                
      }
  }
]
module.exports=rules