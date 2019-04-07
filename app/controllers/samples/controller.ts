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
  ISetDomainY,
  IGetAllEnzymeTypesFulfilled,
  IGetBinsFulfilled,
  IResetDomain, ISetBinView, IGetTaxonomiesFulfilled, ISetSelectedTaxonomy, IResetCoverage, IResetGC, IResetBin, IResetTaxonomies
} from './interfaces'
import {ISetBinFilter} from './index'

export const getInitialState = (): ISamplesState => ({
  filters: {binView: true, excludedTaxonomies: []},
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
    taxonomies: action.payload,
  }
}
export const getTaxonomiesFulfilled = (state: ISamplesState, action: IGetTaxonomiesFulfilled): ISamplesState => {
  return {
    ...state,
    taxonomies: action.payload,
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

export const setSelectedTaxonomy = (state: ISamplesState, action: ISetSelectedTaxonomy): ISamplesState => {
  return {
    ...state,
    filters: {
      ...state.filters,
      selectedTaxonomy: action.taxonomy,
    },
  }
}

export const addExcludedTaxonomy = (state: ISamplesState, action: ISetSelectedTaxonomy): ISamplesState => {
  return {
    ...state,
    filters: {
      ...state.filters,
      excludedTaxonomies: [...state.filters.excludedTaxonomies, action.taxonomy],
    },
  }
}
export const resetTaxonomies = (state: ISamplesState, action: IResetTaxonomies): ISamplesState => {
  return {
    ...state,
    filters: {
      ...state.filters,
      excludedTaxonomies: [],
      selectedTaxonomy: undefined,
    },
  }
}

export const setDomain = (state: ISamplesState, action: ISetDomain): ISamplesState => {
  return {
    ...state,
    filters: {
      ...state.filters,
      domain: action.domain,
    },
  }
}
export const setDomainX = (state: ISamplesState, action: ISetDomainX): ISamplesState => {
  return {
    ...state,
    filters: {
      ...state.filters,
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
      ...state.filters,
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
export const resetBin = (state: ISamplesState, action: IResetBin): ISamplesState => {
  return {
    ...state,
    filters: {
      ...state.filters,
      bin: undefined,
    },
  }
}

export const setBinView = (state: ISamplesState, action: ISetBinView): ISamplesState => {
  return {
    ...state,
    filters: {
      ...state.filters,
      binView: action.binView,
    },
  }
}

export const removeFilters = (state: ISamplesState, action: IRemoveFilters): ISamplesState => {
  return {
    ...state,
    filters: {binView: true, excludedTaxonomies: []},
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
export const resetGC = (state: ISamplesState, action: IResetGC): ISamplesState => {
  return {
    ...state,
    filters: {
      ...state.filters,
      domain: {
        ...state.filters.domain,
        x: undefined,
      },
    },
  }
}
export const resetCoverage = (state: ISamplesState, action: IResetCoverage): ISamplesState => {
  return {
    ...state,
    filters: {
      ...state.filters,
      domain: {
        ...state.filters.domain,
        y: undefined,
      },
    },
  }
}