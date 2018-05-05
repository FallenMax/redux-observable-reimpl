import { AbstractAction } from '../../store/abstract_action'

// actions
export type Multiply = AbstractAction<'multiply', number>
export type Divide = AbstractAction<'divide', number>
export type Action = Multiply | Divide
