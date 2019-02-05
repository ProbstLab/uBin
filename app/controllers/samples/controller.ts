import {
  IGetEnzymeDistributionFulfilled,
  IGetImportsFulfilled,
  IGetTaxonomiesForImportFulfilled,
  ISamplesState,
  ISetImportedRecord
} from './interfaces'
import {TreeCreator} from "../../utils/treeCreator";

export const getInitialState = (): ISamplesState => ({
  importRecords: [],
})

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
export const setImportedRecord = (state: ISamplesState, action: ISetImportedRecord): ISamplesState => {
  return {
    ...state,
    recordId: action.recordId
  }
}