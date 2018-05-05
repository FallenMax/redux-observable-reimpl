import { Store } from '../../store/abstract_store'
import { EveryAction } from '../../store/action'
import { Stream } from '../../util/stream'
import { Random } from '../add_subtract/action'
import { Multiply } from './action'

// epic
export const randomThenMultiply = (
  action$: Stream<EveryAction>,
  store: Store
): Stream<Multiply> => {
  return action$
    .filter<Random>(val => val.type === 'random')
    .delay(1000)
    .map<Multiply>(s => {
      return {
        type: 'multiply',
        payload: s.payload,
      }
    })
    .log('addThenRandom')
}
export const epic = [randomThenMultiply]
