import * as AddSubtract from '../features/add_subtract/epic'
import * as MultiplyDivide from '../features/multiply_divide/epic'
import { Stream } from '../util/stream'
import { AbstractEpic } from './abstract_epic'
import { EveryAction } from './action'
import { Store } from './store'

const epics: AbstractEpic<any>[] = [...AddSubtract.epic, ...MultiplyDivide.epic]

export const rootEpic = (
  action$: Stream<EveryAction>,
  store: Store
): Stream<EveryAction> => {
  return Stream.merge(epics.map(epic => epic(action$, store)))
}
