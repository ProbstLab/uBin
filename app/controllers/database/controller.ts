import {IConnectDatabaseFulfilled, IDBState, IGetImportsPending} from './interfaces'

export const getInitialState = (): IDBState => ({
  id: 'default-db',
})

export const connectDatabaseFulfilled = (state: IDBState, action: IConnectDatabaseFulfilled): IDBState => {
  return {
    ...state,
    connection: action.payload
  }
}

export const getImportsPending = (state: IDBState, action: IGetImportsPending): IDBState => {
  return {
    ...state
  }
}