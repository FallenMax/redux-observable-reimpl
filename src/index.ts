interface AbstractAction<T, P> {
  type: T
  payload: P
}

namespace AddSubtract {
  // actions
  export type Add = AbstractAction<'add', number>
  export type Subtract = AbstractAction<'subtract', number>
  export type Action = Add | Subtract

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

interface Listener {
  (state: State): any
}

const store = {
  state: {
    addSubtract: AddSubtract.state,
    multiDivide: MultiplyDivide.state,
  } as State,
  listeners: [] as Listener[],
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
    if (store.listeners.indexOf(listener) === -1) {
      store.listeners.push(listener)
      listener(store.state)
      return function unsubscribe() {
        store.unsubscribe(listener)
      }
    }
  },
  unsubscribe(listener: Listener) {
    const index = store.listeners.indexOf(listener)
    if (index !== -1) {
      store.listeners.splice(index, 1)
    }
  },
  dispatch(action: EveryAction) {
    store.state = store.reducer(store.state, action)
    store.listeners.forEach(l => l(store.state))
  },
}

const view = (state: State) => {
  const val1 = state.addSubtract.value
  const val2 = state.multiDivide.value
  console.log({ val1, val2 })
}

store.subscribe(view)

setTimeout(function() {
  store.dispatch({
    type: 'add',
    payload: 3,
  })
}, 1000)

setTimeout(function() {
  store.dispatch({
    type: 'multiply',
    payload: 2,
  })
}, 1000)
