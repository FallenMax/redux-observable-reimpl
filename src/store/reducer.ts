import * as AddSubtract from '../features/add_subtract/reducer'
import * as MultiplyDivide from '../features/multiply_divide/reducer'

export interface State {
  addSubtract: AddSubtract.State
  multiDivide: MultiplyDivide.State
}

export const state = {
  addSubtract: AddSubtract.state,
  multiDivide: MultiplyDivide.state,
}

export const reducers = {
  addSubtract: AddSubtract.reducer,
  multiDivide: MultiplyDivide.reducer,
}
