import * as AddSubtract from '../features/add_subtract/action'
import * as MultiplyDivide from '../features/multiply_divide/action'

export type EveryAction = AddSubtract.Action | MultiplyDivide.Action
