import { Stream } from '../util/stream'
import { Listener, Store } from './store'
import { EveryAction } from './action'
import { rootEpic } from './epic'
import { State, reducers, state as initState } from './reducer'

export const createStore = (): Store => {
  let state: State = initState
  const listeners = [] as Listener[]
  const epicIn$ = Stream<EveryAction>().log('epic in')

  const reducer = (state: State, action: EveryAction): State => {
    // @ts-ignore
    return Object.entries(state).reduce(
      // @ts-ignore
      (prev, [key, stateSlice]) => {
        // @ts-ignore
        return Object.assign(prev, {
          // @ts-ignore
          [key]: reducers[key](stateSlice, action),
        })
      },
      {}
    )
  }
  const getState = (): State => {
    return state
  }
  const subscribe = (listener: Listener) => {
    if (listeners.indexOf(listener) === -1) {
      listeners.push(listener)
      listener(state)
    }
    return function() {
      unsubscribe(listener)
    }
  }
  const unsubscribe = (listener: Listener) => {
    const index = listeners.indexOf(listener)
    if (index !== -1) {
      listeners.splice(index, 1)
    }
  }
  const dispatch = (action: EveryAction) => {
    console.log('action ', action)
    state = reducer(state, action)
    listeners.forEach(l => l(state))
    // effects
    epicIn$(action)
  }
  const store = {
    getState,
    subscribe,
    unsubscribe,
    dispatch,
  }

  const epicOut$ = rootEpic(epicIn$, store)
    .log('epic out')
    .subscribe(store.dispatch)

  return store
}
