import {
  IGetEnzymeDistributionFulfilled,
  IGetImportsFulfilled,
  IGetImportsPending,
  IGetSamplesFulfilled,
  IGetTaxonomiesForImportFulfilled,
  IRemoveFilters,
  IRevertFilters,
  ISamplesState,
  ISetImportedRecord,
  ISetDomain,
  ISetDomainX,
  ISetDomainY,
  IGetAllEnzymeTypesFulfilled,
  IGetBinsFulfilled,
  IResetDomain,
  ISetBinView,
  IGetTaxonomiesFulfilled,
  ISetSelectedTaxonomy,
  IResetCoverage,
  IResetGC,
  IResetBin,
  IResetTaxonomies,
  ISetConsensus,
  ISetGCAverage,
  ISetCoverageAverage,
  ISetConsensusName,
  ISetSampleName,
  ISetSavingBins,
  ISetTotalLength,
  ISetNewBinToData,
  ISetReloadSamples,
  ISetSelectedCount
} from './interfaces'
import {ISetBinFilter} from './index'
import {Sample} from '../../db/entities/Sample'
import { ISampleFilter } from 'samples'

export const getInitialState = (): ISamplesState => ({
  filters: {binView: true, excludedTaxonomies: []},
  pastFilters: [],
  importRecords: [],
  importsLoaded: false,
  importRecordsPending: false,
  bins: [],
  totalLength: 0,
})

const updatePastFilters = (pastFilters: ISampleFilter[], latestFilter: ISampleFilter): ISampleFilter[] => {
  if (pastFilters.length >= 10) {
    return [...pastFilters.slice(1), latestFilter]
  }
  return [...pastFilters, latestFilter]
}

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
    pastFilters: updatePastFilters(state.pastFilters, state.filters)
  }
}

export const addExcludedTaxonomy = (state: ISamplesState, action: ISetSelectedTaxonomy): ISamplesState => {
  return {
    ...state,
    filters: {
      ...state.filters,
      excludedTaxonomies: [...state.filters.excludedTaxonomies, action.taxonomy],
    },
    pastFilters: updatePastFilters(state.pastFilters, state.filters)
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
    pastFilters: updatePastFilters(state.pastFilters, state.filters)
  }
}

export const setDomain = (state: ISamplesState, action: ISetDomain): ISamplesState => {
  return {
    ...state,
    filters: {
      ...state.filters,
      domain: action.domain,
    },
    pastFilters: updatePastFilters(state.pastFilters, state.filters)
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
    pastFilters: updatePastFilters(state.pastFilters, state.filters)
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
    pastFilters: updatePastFilters(state.pastFilters, state.filters)
  }
}

export const setBinFilter = (state: ISamplesState, action: ISetBinFilter): ISamplesState => {
  return {
    ...state,
    filters: {
      ...state.filters,
      bin: action.bin,
    },
    pastFilters: updatePastFilters(state.pastFilters, state.filters)
  }
}
export const resetBin = (state: ISamplesState, action: IResetBin): ISamplesState => {
  return {
    ...state,
    filters: {
      ...state.filters,
      bin: undefined,
    },
    pastFilters: updatePastFilters(state.pastFilters, state.filters)
  }
}

export const setBinView = (state: ISamplesState, action: ISetBinView): ISamplesState => {
  return {
    ...state,
    filters: {
      ...state.filters,
      binView: action.binView,
    },
    pastFilters: updatePastFilters(state.pastFilters, state.filters)
  }
}

// Remove all filters and reset it to the default state
export const removeFilters = (state: ISamplesState, action: IRemoveFilters): ISamplesState => {
  return {
    ...state,
    filters: {binView: true, excludedTaxonomies: []},
    pastFilters: updatePastFilters(state.pastFilters, state.filters)
  }
}

// If available, revert to the previous filter
export const revertFilters = (state: ISamplesState, action: IRevertFilters): ISamplesState => {
  if (!state.pastFilters.length) {
    return state
  }
  return {
    ...state,
    filters: state.pastFilters[state.pastFilters.length - 1],
    pastFilters: state.pastFilters.slice(0, -1)
  }
}

export const resetDomain = (state: ISamplesState, action: IResetDomain): ISamplesState => {
  return {
    ...state,
    filters: {
      ...state.filters,
      domain: undefined,
    },
    pastFilters: updatePastFilters(state.pastFilters, state.filters)
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
    pastFilters: updatePastFilters(state.pastFilters, state.filters)
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
    pastFilters: updatePastFilters(state.pastFilters, state.filters)
  }
}

export const setConsensus = (state: ISamplesState, action: ISetConsensus): ISamplesState => {
  return {
    ...state,
    consensus: action.consensus,
  }
}
export const setConsensusName = (state: ISamplesState, action: ISetConsensusName): ISamplesState => {
  return {
    ...state,
    consensusName: action.consensusName,
  }
}
export const setSampleName = (state: ISamplesState, action: ISetSampleName): ISamplesState => {
  return {
    ...state,
    sampleName: action.sampleName,
  }
}
export const setGCAverage = (state: ISamplesState, action: ISetGCAverage): ISamplesState => {
  return {
    ...state,
    gcAvg: action.avg,
  }
}
export const setCoverageAverage = (state: ISamplesState, action: ISetCoverageAverage): ISamplesState => {
  return {
    ...state,
    coverageAvg: action.avg,
  }
}

export const setTotalLength = (state: ISamplesState, action: ISetTotalLength): ISamplesState => {
  return {
    ...state,
    totalLength: action.length,
  }
}

export const setSavingBins = (state: ISamplesState, action: ISetSavingBins): ISamplesState => {
  return {
    ...state,
    savingBins: action.saving,
  }
}

export const setReloadSamples = (state: ISamplesState, action: ISetReloadSamples): ISamplesState => {
  return {
    ...state,
    reloadSamples: action.reload,
  }
}

export const setSelectedCount = (state: ISamplesState, action: ISetSelectedCount): ISamplesState => {
  return {
    ...state,
    selectedCount: action.selectedCount,
  }
}

export const setNewBinToData = (state: ISamplesState, action: ISetNewBinToData): ISamplesState => {
  let newSamples: Sample[]|undefined = state.samples
  if (newSamples && action.bin && action.ids.length) {
    for (let i: number = 0; i < newSamples.length; i++) {
      if (action.ids.includes(newSamples[i].id)) {
        newSamples[i].bin = action.bin
      }
    }
  }
  return {
    ...state,
    samples: newSamples,
  }
}