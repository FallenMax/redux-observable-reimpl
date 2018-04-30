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
    value: number
  }
  export const state: State = {
    value: 123,
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
    value: number
  }
  export const state: State = {
    value: 123,
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

const state: State = {
  addSubtract: AddSubtract.state,
  multiDivide: MultiplyDivide.state,
}

const reducers = {
  addSubtract: AddSubtract.reducer,
  multiDivide: MultiplyDivide.reducer,
}

// @ts-ignore
const reducer = (state: State, action: EveryAction): State => {
  const newState = {}
  for (const key in state) {
    if (state.hasOwnProperty(key)) {
      //
    }
  }

  return Object.keys(state)
    .map(key => ({
      key,
      // @ts-ignore
      state: reducers[key](state[key], action),
    }))
    .reduce(
      (prev, cur) =>
        // @ts-ignore
        Object.assign(prev, {
          [cur.key]: cur.state,
        }),
      {}
    )
}
