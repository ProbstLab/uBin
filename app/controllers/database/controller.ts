import {
  IConnectDatabaseFulfilled,
  IDBState,
  IGetSamplesPending,
  IGetTaxonomiesForImportPending,
  ISetSaveBinFulfilled, ISetSaveBinPending, ISetSaveBinRejected
} from './interfaces'

export const getInitialState = (): IDBState => ({
  id: 'default-db',
  samplesPending: false,
  taxonomiesPending: false,
})

export const connectDatabaseFulfilled = (state: IDBState, action: IConnectDatabaseFulfilled): IDBState => {
  return {
    ...state,
    connection: action.payload,
  }
}

export const getSamplesPending = (state: IDBState, action: IGetSamplesPending): IDBState => {
  let pendingState: boolean = true
  if (action.hasOwnProperty('samplesPending')) {
    pendingState = action.samplesPending
  }
  return {
    ...state,
    samplesPending: pendingState,
  }
}

export const getTaxonomiesPending = (state: IDBState, action: IGetTaxonomiesForImportPending): IDBState => {
  let pendingState: boolean = true
  if (action.hasOwnProperty('taxonomiesPending')) {
    pendingState = action.taxonomiesPending
  }
  return {
    ...state,
    taxonomiesPending: pendingState,
  }
}

export const setSaveBinPending = (state: IDBState, action: ISetSaveBinPending): IDBState => {
  return {
    ...state,
    savingBinState: 'pending',
  }
}
export const setSaveBinRejected = (state: IDBState, action: ISetSaveBinRejected): IDBState => {
  return {
    ...state,
    savingBinState: 'rejected',
  }
}
export const setSaveBinFulfilled = (state: IDBState, action: ISetSaveBinFulfilled): IDBState => {
  return {
    ...state,
    savingBinState: 'fulfilled',
  }
}