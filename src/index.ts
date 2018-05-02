import { Stream } from './stream'

interface AbstractAction<T, P> {
  type: T
  payload: P
}

interface Epic<T extends EveryAction> {
  (action$: Stream<EveryAction>, store: Store): Stream<T>
}

namespace AddSubtract {
  // actions
  export type Add = AbstractAction<'add', number>
  export type Subtract = AbstractAction<'subtract', number>
  export type Random = AbstractAction<'random', number>
  export type Nothing = AbstractAction<'nothing', null | undefined>
  export type Action = Add | Subtract | Random | Nothing

  // state
  export interface State {
    readonly value: number
  }
  export const state: State = {
    value: 1,
  }

  // reducer
  export const reducer = (state: State, action: EveryAction): State => {
    switch (action.type) {
      case 'add':
        return {
          ...state,
          value: state.value + action.payload,
        }

      case 'subtract':
        return {
          ...state,
          value: state.value - action.payload,
        }
      default:
        return state
    }
  }

  // epic
  export const addThenRandom: Epic<Random> = (action$, store) => {
    return action$
      .filter<Add>(val => val.type === 'add')
      .delay(1000)
      .map<Random>(s => ({
        type: 'random',
        payload: s.payload * Math.random(),
      }))
  }
  export const multiplyThenNothing: Epic<Nothing> = (action$, store) => {
    return action$
      .filter<MultiplyDivide.Multiply>(val => val.type === 'multiply')
      .delay(1000)
      .map<Nothing>(_ => ({
        type: 'nothing',
        payload: null,
      }))
  }

  export const epic = [addThenRandom, multiplyThenNothing]
}

namespace MultiplyDivide {
  // actions
  export type Multiply = AbstractAction<'multiply', number>
  export type Divide = AbstractAction<'divide', number>
  export type Action = Multiply | Divide

  // state
  export interface State {
    readonly value: number
  }
  export const state: State = {
    value: 2,
  }

  // reducer
  export const reducer = (state: State, action: EveryAction): State => {
    switch (action.type) {
      case 'multiply':
        return {
          ...state,
          value: state.value * action.payload,
        }

      case 'divide':
        return {
          ...state,
          value: state.value / action.payload,
        }
      default:
        return state
    }
  }

  // epic
  export const randomThenMultiply = (
    action$: Stream<EveryAction>,
    store: Store
  ): Stream<Multiply> => {
    return action$
      .filter<AddSubtract.Random>(val => val.type === 'random')
      .delay(1000)
      .map<Multiply>(s => ({
        type: 'multiply',
        payload: s.payload,
      }))
  }
  export const epic = [randomThenMultiply]
}

type EveryAction = AddSubtract.Action | MultiplyDivide.Action

interface State {
  addSubtract: AddSubtract.State
  multiDivide: MultiplyDivide.State
}

const reducers = {
  addSubtract: AddSubtract.reducer,
  multiDivide: MultiplyDivide.reducer,
}

const epics: Epic<any>[] = [...AddSubtract.epic, ...MultiplyDivide.epic]
const epic = (
  action$: Stream<EveryAction>,
  store: Store
): Stream<EveryAction> => {
  return Stream.merge(epics.map(epic => epic(action$, store)))
}

interface Listener {
  (state: State): any
}
interface Unsubscriber {
  (): void
}

interface Store {
  _listeners: Listener[]
  state: State
  reducer(state: State, action: EveryAction): State
  getState(): State
  subscribe(listener: Listener): Unsubscriber
  unsubscribe(listener: Listener): void
  dispatch(action: EveryAction): void
}

const store: Store = {
  _listeners: [],
  state: {
    addSubtract: AddSubtract.state,
    multiDivide: MultiplyDivide.state,
  } as State,
  reducer(state: State, action: EveryAction): State {
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
  },
  getState(): State {
    return store.state
  },
  subscribe(listener: Listener) {
    if (store._listeners.indexOf(listener) === -1) {
      store._listeners.push(listener)
      listener(store.state)
    }
    return function unsubscribe() {
      store.unsubscribe(listener)
    }
  },
  unsubscribe(listener: Listener) {
    const index = store._listeners.indexOf(listener)
    if (index !== -1) {
      store._listeners.splice(index, 1)
    }
  },
  dispatch(action: EveryAction) {
    console.log('action: ', action)
    store.state = store.reducer(store.state, action)
    store._listeners.forEach(l => l(store.state))
    epic(Stream(action), store)
  },
}

const view = (state: State) => {
  const val1 = state.addSubtract.value
  const val2 = state.multiDivide.value
  console.log({ val1, val2 })
}

// -------------- test -------------

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
