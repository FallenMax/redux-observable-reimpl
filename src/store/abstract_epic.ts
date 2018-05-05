import { Stream } from '../util/stream'
import { Store } from './abstract_store'
import { EveryAction } from './action'

export interface AbstractEpic<T extends EveryAction> {
  (action$: Stream<EveryAction>, store: Store): Stream<T>
}
