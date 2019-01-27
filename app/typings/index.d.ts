import { ActionCreatorsMapObject } from 'redux'
import { ThunkAction } from 'redux-thunk'

declare module 'redux' {
  /**
   * Overload for bindActionCreators redux function, returns expects responses
   * from thunk actions
   */
  // function bindActionCreators<M extends ActionCreatorsMapObject<any>>(
  //   actionCreators: M,
  //   dispatch: Dispatch,
  //   ): { [N in keyof M]: ReturnType<M[N]> extends ThunkAction<any, any, any, any> ? (...args: Parameters<M[N]>) => ReturnType<ReturnType<M[N]>> : M[N] }
}