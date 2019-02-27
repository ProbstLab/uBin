import {
  IGetEnzymeDistributionFulfilled,
  IGetImportsFulfilled, IGetSamplesFulfilled,
  IGetTaxonomiesForImportFulfilled, IRemoveFilters,
  ISamplesState,
  ISetImportedRecord, ISetScatterDomain, ISetTaxonomyIds
} from './interfaces'
import {TreeCreator} from "../../utils/treeCreator";

export const getInitialState = (): ISamplesState => ({
  filters: {},
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
    taxonomyTreeFull: TreeCreator.createTree(action.payload),
  }
}

export const getEnzymeDistributionFulfilled = (state: ISamplesState, action: IGetEnzymeDistributionFulfilled): ISamplesState => {
  return {
    ...state,
    enzymeDistribution: action.payload,
  }
}
export const setImportedRecord = (state: ISamplesState, action: ISetImportedRecord): ISamplesState => {
  return {
    ...state,
    recordId: action.recordId,
  }
}
export const getSamplesFulfilled = (state: ISamplesState, action: IGetSamplesFulfilled): ISamplesState => {
  return {
    ...state,
    samples: action.payload,
  }
}

export const setTaxonomyIds = (state: ISamplesState, action: ISetTaxonomyIds): ISamplesState => {
  return {
    ...state,
    filters: {
      taxonomyIds: action.taxonomyIds,
    },
  }
}
export const setScatterDomain = (state: ISamplesState, action: ISetScatterDomain): ISamplesState => {
  return {
    ...state,
    filters: {
      scatterDomain: action.scatterDomain,
    },
  }
}
export const removeFilters = (state: ISamplesState, action: IRemoveFilters): ISamplesState => {
  return {
    ...state,
    filters: {},
  }
}