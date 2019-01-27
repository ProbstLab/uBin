import {IGetImportsFulfilled, ISamplesState, ISetSampleFilter} from './interfaces'

export const getInitialState = (): ISamplesState => ({
  filter: {
    taxonomy: ['x'],
  },
  importRecords: [],
})

export const setFilter = (state: ISamplesState, action: ISetSampleFilter): ISamplesState => {
  return { ...state, filter: action.filter }
}

export const getImportsFulfilled = (state: ISamplesState, action: IGetImportsFulfilled): ISamplesState => {
  return {
    ...state,
    importRecords: [...state.importRecords, ...action.payload]
  }
}