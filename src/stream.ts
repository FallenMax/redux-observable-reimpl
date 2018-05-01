// ------------ Stream: core ------------

export interface StreamListener<T> {
  (value: T): void
}

export interface StreamDependent<T> {
  updateDependent(val: T): void
  flushDependent(): void
}

export interface Stream<T> {
  (val: T | undefined): void
  (): T
  _listeners: StreamListener<T>[]
  _dependents: StreamDependent<T>[]
  _value: T | undefined
  _changed: boolean
}

export const subscribe = function<T>(
  stream$: Stream<T>,
  listener: StreamListener<T>,
  emitOnSubscribe = true
) {
  if (stream$._listeners.indexOf(listener) === -1) {
    if (emitOnSubscribe && stream$._value !== undefined) {
      listener(stream$._value)
    }
    stream$._listeners.push(listener)
  }
}

const updateStream = function<T>(stream$: Stream<T>, val: T) {
  stream$._value = val
  stream$._changed = true
  stream$._dependents.forEach(dep => dep.updateDependent(val))
}

const flushStream = function<T>(stream$: Stream<T>) {
  if (stream$._changed) {
    stream$._changed = false
    if (stream$._value !== undefined) {
      stream$._listeners.forEach(l => l(stream$._value as T))
    }
    stream$._dependents.forEach(dep => dep.flushDependent())
  }
}

export const Stream = <T>(init?: T): Stream<T> => {
  const stream$: Stream<T> = function(val: T) {
    if (val === undefined) return stream$._value
    updateStream(stream$, val)
    flushStream(stream$)
  } as Stream<T>
  stream$._value = init
  stream$._changed = false
  stream$._listeners = []
  stream$._dependents = []
  return stream$
}

// ------------ Stream: combine ------------
export function combine<T1, V>(
  streams: [Stream<T1>],
  combiner: (s1: T1) => V | undefined
): Stream<V>
export function combine<T1, T2, V>(
  streams: [Stream<T1>, Stream<T2>],
  combiner: (s1: T1, s2: T2) => V | undefined
): Stream<V>
export function combine<T1, T2, T3, V>(
  streams: [Stream<T1>, Stream<T2>, Stream<T3>],
  combiner: (s1: T1, s2: T2, s3: T3) => V | undefined
): Stream<V>
export function combine(
  streams: Stream<any>[],
  combiner: (...values: any[]) => any
): Stream<any> {
  let cached = streams.map(stream$ => stream$())
  const combined$ = Stream(combiner(...cached))

  streams.forEach((stream, i) => {
    stream._dependents.push({
      updateDependent(val: any) {
        cached[i] = val
        updateStream(combined$, combiner(...cached))
      },
      flushDependent() {
        flushStream(combined$)
      },
    })
  })

  return combined$
}

// ------------ Stream: log --------------
export const log = function log<T>(
  stream$: Stream<T>,
  name: string
): Stream<T> {
  subscribe(stream$, val => console.log(`[stream] ${name}: ${val}`))
  return stream$
}

// ------------ Stream: map --------------
export const map = function map<T, V>(
  stream$: Stream<T>,
  mapper: (val: T) => V | undefined
): Stream<V> {
  return combine([stream$], mapper)
}

// ------------ Stream: unique --------------
export const unique = function unique<T>(stream$: Stream<T>): Stream<T> {
  let lastValue = stream$()
  const unique$ = Stream(lastValue)
  subscribe(stream$, val => {
    if (val !== lastValue) {
      unique$(val)
      lastValue = val
    }
  })
  return unique$
}

// ------------ Stream: filter --------------

export const filter = function filter<T>(
  stream$: Stream<T>,
  predict: (val: T) => boolean
): Stream<T> {
  const mapper = (val: T) => (predict(val) ? val : undefined)
  return map<T, T>(stream$, mapper)
}

// ------------ tests --------------
const a = log(Stream(1), 'a')
const b = log(Stream(2), 'b')
const c = log(Stream(3), 'c')
const d = log(combine([a, b, c], (a, b, c) => a + b + c), 'd')
const e = log(map(d, x => x * 3), 'e')
const f = log(filter(e, x => Boolean(x % 2)), 'f')
