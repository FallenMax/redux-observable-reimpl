import { EveryAction } from '../../store/action'

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
