import { AbstractEpic } from '../../store/abstract_epic'
import { Multiply } from '../multiply_divide/action'
import { Add, Nothing, Random } from './action'

export const addThenRandom: AbstractEpic<Random> = (action$, store) => {
  return action$
    .filter<Add>(val => val.type === 'add')
    .delay(1000)
    .map<Random>(s => {
      return {
        type: 'random',
        payload: s.payload * Math.random(),
      }
    })
}

export const multiplyThenNothing: AbstractEpic<Nothing> = (action$, store) => {
  const s = store.getState()
  console.log(s.multiDivide)

  return action$
    .filter<Multiply>(val => val.type === 'multiply')
    .delay(1000)
    .map<Nothing>(_ => ({
      type: 'nothing',
      payload: null,
    }))
}

export const epic = [addThenRandom, multiplyThenNothing]
