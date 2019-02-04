import {IGetEnzymeDistributionFulfilled, IGetImportsFulfilled, IGetTaxonomiesForImportFulfilled, ISamplesState, ISetSampleFilter} from './interfaces'
import {TreeCreator} from "../../utils/treeCreator";

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
    importRecords: [...state.importRecords.filter(value => value.id !== action.payload.id ), ...action.payload],
  }
}

export const getTaxonomiesForImportFulfilled = (state: ISamplesState, action: IGetTaxonomiesForImportFulfilled): ISamplesState => {
  return {
    ...state,
    taxonomyTreeFull: TreeCreator.createTree(action.payload)
  }
}

export const getEnzymeDistributionFulfilled = (state: ISamplesState, action: IGetEnzymeDistributionFulfilled): ISamplesState => {
  return {
    ...state,
    enzymeDistribution: action.payload
  }
}