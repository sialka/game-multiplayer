export default function createPanel(divScore) {
  const state = {
    score: 50,    
  }  
   
  function changeScore(score) {
    state.score = score
  }

  function score() {
    return state.score
  }

  function show() {
    console.log('score: ', divScore);
    // score.innerText = 100;
    // divScore.innerText = 100;
  }

  return {
    state,
    changeScore,
    score,  
    show,  
  }
}