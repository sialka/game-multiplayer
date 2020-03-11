export default function create() {
  const state = {
    info: '',
    mode: 'true',
  }
  
  function change(change) {
    state.mode = change
  }

  function mode() {
    return state.mode
  }

  function info(info) {    
    if (state.mode === "true") {
      state.info = info
      return console.log(`>> ${state.info}`)
    }
  }

  return {
    state,
    change,
    mode,
    info
  }
}