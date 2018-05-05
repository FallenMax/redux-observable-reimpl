import { AbstractAction } from '../../store/abstract_action'

export type Add = AbstractAction<'add', number>
export type Subtract = AbstractAction<'subtract', number>
export type Random = AbstractAction<'random', number>
export type Nothing = AbstractAction<'nothing', null>
export type Action = Add | Subtract | Random | Nothing
