import { Stream } from '../util/stream'
import { Store } from './store'
import { EveryAction } from './action'

export interface AbstractEpic<T extends EveryAction> {
  (action$: Stream<EveryAction>, store: Store): Stream<T>
}
