export interface AbstractAction<T, P> {
  type: T
  payload: P
}
