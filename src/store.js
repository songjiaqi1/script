
export default function createStore(initState){
  let state = initState;
  const listenners = [];

  const subscribe = (fun) => {
    listenners.push(fun); 
  }

  const dispatch = (action) => {
    listenners.forEach((listenner) =>{
      listenner(action);
    });
  }

  const getState = () => {
    return state;
  }

  return {
    subscribe,
    dispatch,
    getState,
  }
}