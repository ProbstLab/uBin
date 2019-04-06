declare module 'common' {
  interface IObjectWithId {
    id: string|number
  }

  interface IValueMap<TValueType extends IObjectWithId> {
    [id: string]: TValueType
  }

  interface Action<T extends string> {
    type: T
  }

  interface ActionWithPayload<T extends string, P> extends Action<T>{
    payload: P
  }
}