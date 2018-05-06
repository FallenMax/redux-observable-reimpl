import { createStore } from './store'
import { State } from './store/reducer'

const store = createStore()

// -------------- view -------------

const view = (state: State) => {
  const val1 = state.addSubtract.value
  const val2 = state.multiDivide.value
  console.log('view', { val1, val2 })
}
store.subscribe(view)

setTimeout(function() {
  store.dispatch({
    type: 'add',
    payload: 1,
  })
}, 1000)

setTimeout(function() {
  store.dispatch({
    type: 'multiply',
    payload: 2,
  })
}, 2000)
