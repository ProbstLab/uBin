import {
  IGetEnzymeDistributionFulfilled,
  IGetImportsFulfilled,
  IGetImportsPending,
  IGetSamplesFulfilled,
  IGetTaxonomiesForImportFulfilled,
  IRemoveFilters,
  ISamplesState,
  ISetImportedRecord,
  ISetDomain,
  ISetDomainX,
  ISetTaxonomyId,
  ISetDomainY,
  IGetAllEnzymeTypesFulfilled,
  IGetBinsFulfilled,
  IResetDomain
} from './interfaces'
import {TreeCreator} from '../../utils/treeCreator'
import {ISetBinFilter} from './index'

export const getInitialState = (): ISamplesState => ({
  filters: {},
  importRecords: [],
  importsLoaded: false,
  importRecordsPending: false,
  bins: [],
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
  console.log("Payload:", action.payload)
  return {
    ...state,
    samples: action.payload,
  }
}
export const getBinsFulfilled = (state: ISamplesState, action: IGetBinsFulfilled): ISamplesState => {
  return {
    ...state,
    bins: action.payload,
  }
}

export const setTaxonomyId = (state: ISamplesState, action: ISetTaxonomyId): ISamplesState => {
  console.log("Set taxonomy id", action)
  return {
    ...state,
    filters: {
      taxonomyId: action.taxonomyId,
    },
  }
}

export const setDomain = (state: ISamplesState, action: ISetDomain): ISamplesState => {
  return {
    ...state,
    filters: {
      domain: action.domain,
    },
  }
}
export const setDomainX = (state: ISamplesState, action: ISetDomainX): ISamplesState => {
  return {
    ...state,
    filters: {
      domain: {
        ...state.filters.domain,
        x: action.domain,
      },
    },
  }
}
export const setDomainY = (state: ISamplesState, action: ISetDomainY): ISamplesState => {
  return {
    ...state,
    filters: {
      domain: {
        ...state.filters.domain,
        y: action.domain,
      },
    },
  }
}

export const setBinFilter = (state: ISamplesState, action: ISetBinFilter): ISamplesState => {
  return {
    ...state,
    filters: {
      ...state.filters,
      bin: action.bin,
    },
  }
}

export const removeFilters = (state: ISamplesState, action: IRemoveFilters): ISamplesState => {
  return {
    ...state,
    filters: {},
  }
}
export const resetDomain = (state: ISamplesState, action: IResetDomain): ISamplesState => {
  return {
    ...state,
    filters: {
      ...state.filters,
      domain: undefined,
    },
  }
}