import {
  IGetEnzymeDistributionFulfilled,
  IGetImportsFulfilled, IGetImportsPending, IGetSamplesFulfilled,
  IGetTaxonomiesForImportFulfilled, IRemoveFilters,
  ISamplesState,
  ISetImportedRecord, ISetScatterDomain, ISetScatterDomainX, ISetTaxonomyIds, ISetScatterDomainY, IGetAllEnzymeTypesFulfilled
} from './interfaces'
import {TreeCreator} from "../../utils/treeCreator"
import {IScatterDomain} from 'samples'

export const getInitialState = (): ISamplesState => ({
  filters: {},
  importRecords: [],
  importsLoaded: false,
  importRecordsPending: false,
})

export const getImportsPending = (state: ISamplesState, action: IGetImportsPending): ISamplesState => {
  return {
    ...state,
    importRecordsPending: true,
  }
}
export const getImportsFulfilled = (state: ISamplesState, action: IGetImportsFulfilled): ISamplesState => {
  return {
    ...state,
    importsLoaded: true,
    importRecordsPending: false,
    importRecords: [...action.payload],
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
export const getAllEnzymeTypesFulfilled = (state: ISamplesState, action: IGetAllEnzymeTypesFulfilled): ISamplesState => {
  console.log("enzyme types", action)
  return {
    ...state,
    enzymeTypes: action.payload,
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
export const setScatterDomainX = (state: ISamplesState, action: ISetScatterDomainX): ISamplesState => {
  let newScatterDomain: IScatterDomain = state.filters.scatterDomain ? {x: action.domain, y: state.filters.scatterDomain.y} : {x: action.domain}
  return {
    ...state,
    filters: {
      scatterDomain: newScatterDomain
    },
  }
}
export const setScatterDomainY = (state: ISamplesState, action: ISetScatterDomainY): ISamplesState => {
  let newScatterDomain: IScatterDomain = state.filters.scatterDomain ? {y: action.domain, x: state.filters.scatterDomain.x} : {y: action.domain}
  return {
    ...state,
    filters: {
      scatterDomain: newScatterDomain
    },
  }
}
export const removeFilters = (state: ISamplesState, action: IRemoveFilters): ISamplesState => {
  return {
    ...state,
    filters: {},
  }
}
