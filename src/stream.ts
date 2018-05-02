// ------------ Stream: core ------------

interface StreamListener<T> {
  (value: T): void
}

interface StreamDependent<T> {
  updateDependent(val: T): void
  flushDependent(): void
}

export interface Stream<T> {
  // core
  (val: T | undefined): void
  (): T
  _listeners: StreamListener<T>[]
  _dependents: StreamDependent<T>[]
  _value: T | undefined
  _changed: boolean
  subscribe(listener: StreamListener<T>, emitOnSubscribe?: boolean): void

  // operators
  log(name: string): Stream<T>
  map<V>(mapper: (val: T) => V | undefined): Stream<V>
  unique(): Stream<T>
  filter<V extends T>(predict: (val: T) => boolean): Stream<V>
  delay(delayInMs: number): Stream<T>
}

const proto: Partial<Stream<any>> = {}

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
proto.subscribe = function(this: Stream<any>, listener, emitOnSubscribe) {
  return subscribe(this, listener, emitOnSubscribe)
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

interface StreamNamespace {
  <T>(init?: T): Stream<T>

  combine<T1, V>(
    combiner: (s1: T1) => V | undefined,
    streams: [Stream<T1>]
  ): Stream<V>
  combine<T1, T2, V>(
    combiner: (s1: T1, s2: T2) => V | undefined,
    streams: [Stream<T1>, Stream<T2>]
  ): Stream<V>
  combine<T1, T2, T3, V>(
    combiner: (s1: T1, s2: T2, s3: T3) => V | undefined,
    streams: [Stream<T1>, Stream<T2>, Stream<T3>]
  ): Stream<V>

  merge<A>(streams: [Stream<A>]): Stream<A>
  merge<A, B>(streams: [Stream<A>, Stream<B>]): Stream<A | B>
  merge<A, B, C>(streams: [Stream<A>, Stream<B>, Stream<C>]): Stream<A | B | C>
  merge<V>(streams: Stream<V>[]): Stream<V>
  merge(streams: Stream<any>[]): Stream<any>
}

export const Stream: StreamNamespace = (<T>(init?: T): Stream<T> => {
  const stream$: Stream<T> = function(val: T) {
    if (val === undefined) return stream$._value
    updateStream(stream$, val)
    flushStream(stream$)
  } as Stream<T>
  stream$._value = init
  stream$._changed = false
  stream$._listeners = []
  stream$._dependents = []
  // @ts-ignore
  Object.assign(stream$, proto)
  return stream$
}) as StreamNamespace

// ------------ Stream.combine ------------
export function combine(
  combiner: (...values: any[]) => any,
  streams: Stream<any>[]
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
Stream.combine = combine

// ------------ Stream.merge --------------
export function merge(streams: Stream<any>[]): Stream<any> {
  const merged$ = Stream()
  streams.forEach(stream$ => {
    subscribe(stream$, val => merged$(val))
  })
  return merged$
}
Stream.merge = merge

// ------------ Stream::log --------------
export const log = function log<T>(
  name: string,
  stream$: Stream<T>
): Stream<T> {
  subscribe(stream$, val => console.log(`[stream] ${name}: ${val}`))
  return stream$
}
proto.log = function(this: Stream<any>, name) {
  return log(name, this)
}

// ------------ Stream::map --------------
export const map = function map<T, V>(
  mapper: (val: T) => V | undefined,
  stream$: Stream<T>
): Stream<V> {
  return combine(mapper, [stream$])
}
proto.map = function(this: Stream<any>, mapper) {
  return map(mapper, this)
}

// ------------ Stream::unique --------------
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
proto.unique = function(this: Stream<any>) {
  return unique(this)
}

// ------------ Stream::filter --------------
export const filter = function filter<U, T extends U>(
  predict: (val: U) => boolean,
  stream$: Stream<U>
): Stream<T> {
  const mapper = ((val: U) => (predict(val) ? val : undefined)) as ((
    val: U
  ) => T)
  return map<U, T>(mapper, stream$)
}
proto.filter = function(this: Stream<any>, predict) {
  return filter(predict, this)
}

// ------------ Stream::delay --------------
export const delay = function delay<T>(
  delayInMs: number,
  stream$: Stream<T>
): Stream<T> {
  const delayed$ = Stream<T>()
  subscribe(stream$, value => {
    setTimeout(() => {
      delayed$(value)
    }, delayInMs)
  })
  return delayed$
}
proto.delay = function(this: Stream<any>, delayInMs) {
  return delay(delayInMs, this)
}

// ------------ Stream::pipe --------------
interface Mapper<A, B> {
  (s: Stream<A>): Stream<B>
}
export function pipe<A, B>(
  operators: [Mapper<A, B>],
  stream$: Stream<A>
): Stream<B>
export function pipe<A, B, C>(
  operators: [Mapper<A, B>, Mapper<B, C>],
  stream$: Stream<A>
): Stream<C>
export function pipe<A, B, C, D>(
  operators: [Mapper<A, B>, Mapper<B, C>, Mapper<C, D>],
  stream$: Stream<A>
): Stream<D>
export function pipe(operators: any[], stream$: Stream<any>): Stream<any> {
  return operators.reduce((current$, operator) => operator(current$), stream$)
}

// ------------ tests --------------
// const a = log('a', Stream(1))
// const b = log('b', Stream(2))
// const c = log('c', Stream(3))
// const d = log('d', combine((a, b, c) => a + b + c, [a, b, c]))
// const e = log('e', map(x => x * 3, d))
// const f = log('f', filter(x => Boolean(x % 2), e))
// const abcd = log('abcd', merge([a, b, c, d]))

// a(2)
