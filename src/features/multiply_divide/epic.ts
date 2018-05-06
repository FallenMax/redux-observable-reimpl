import { AbstractEpic } from '../../store/abstract_epic'
import { Random } from '../add_subtract/action'
import { Multiply } from './action'

// epic
export const randomThenMultiply: AbstractEpic<Multiply> = (action$, store) => {
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
