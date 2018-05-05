import { EveryAction } from './action'
import { State } from './reducer'

export interface Listener {
  (state: State): any
}
export interface Unsubscriber {
  (): void
}

export interface Store {
  getState(): State
  subscribe(listener: Listener): Unsubscriber
  unsubscribe(listener: Listener): void
  dispatch(action: EveryAction): void
}
