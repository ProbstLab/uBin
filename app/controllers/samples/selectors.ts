import { createSelector } from 'reselect'

import { ISamplesState } from './interfaces'

import { IClientState } from '..'
import {Enzyme} from '../../db/entities/Enzyme'
import {normaliseArray} from '../../utils/arrayToDict'

const getSamplesState = (state: IClientState) => state.samples

export const getImportRecords = createSelector(
  getSamplesState,
  (state: ISamplesState) => state.importRecords,
)
export const getImportRecordId = createSelector(
  getSamplesState,
  (state: ISamplesState) => state.recordId,
)
export const getActiveRecord = createSelector(
  getSamplesState,
  (state: ISamplesState) => {
    if (state.importRecords.length && state.recordId) {
      for (let i: number = 0; i < state.importRecords.length; i++) {
        if (state.importRecords[i].id === state.recordId) {
          return state.importRecords[i]
        }
      }
    }
    return undefined
  },
)

export const getTaxonomies = createSelector(
  getSamplesState,
  (state: ISamplesState) => state.taxonomies,
)
export const getTaxonomiesMap = createSelector(
  getSamplesState,
  (state: ISamplesState) => normaliseArray(state.taxonomies, 'id'),
)
export const getBinsMap = createSelector(
  getSamplesState,
  (state: ISamplesState) => normaliseArray(state.bins, 'id'),
)

export const getBacterialEnzymeDistributionForChart = createSelector(
  getSamplesState,
  (state: ISamplesState) => state.enzymeDistribution ?
    state.enzymeDistribution.filter(value => value.bacterial)
      .map((value: Enzyme) => {return {name: value.name, amount: value.sampleCount, id: value.id}}) : []
)
export const getArchaealEnzymeDistributionForChart = createSelector(
  getSamplesState,
  (state: ISamplesState) => state.enzymeDistribution ?
    state.enzymeDistribution.filter(value => value.archaeal)
      .map((value: Enzyme) => {return {name: value.name, amount: value.sampleCount, id: value.id}}) : []
)

export const getBacterialEnzymeTypes = createSelector(
  getSamplesState,
  (state: ISamplesState) => state.enzymeTypes ?
    state.enzymeTypes.filter(value => value.bacterial)
      .map((value: Enzyme) => value.name) : []
)
export const getArchaealEnzymeTypes = createSelector(
  getSamplesState,
  (state: ISamplesState) => state.enzymeTypes ?
    state.enzymeTypes.filter(value => value.archaeal)
      .map((value: Enzyme) => value.name) : []
)

export const getSamples = createSelector(
  getSamplesState,
  (state: ISamplesState) => state.samples ? state.samples.map((value: any) => {
    let length: number = value.length/4000
    value.size = length > 3 ? length : 3
    return value
  }) : []
)

export const getSamplesFilters = createSelector(
  getSamplesState,
  (state: ISamplesState) => state.filters
)

export const getBins = createSelector(
  getSamplesState,
  (state: ISamplesState) => state.bins,
)

export const getSelectedBin = createSelector(
  getSamplesState,
  (state: ISamplesState) => state.filters.bin,
)

export const getSelectedTaxonomy = createSelector(
  getSamplesState,
  (state: ISamplesState) => state.filters.selectedTaxonomy,
)
export const getExcludedTaxonomies = createSelector(
  getSamplesState,
  (state: ISamplesState) => state.filters.excludedTaxonomies,
)

export const getBinView = createSelector(
  getSamplesState,
  (state: ISamplesState) => state.filters.binView
)

export const getDomain = createSelector(
  getSamplesState,
  (state: ISamplesState) => state.filters.domain
)

export const getImportRecordsState = createSelector(
  getSamplesState,
  (state: ISamplesState) => {return {pending: state.importRecordsPending, loaded: state.importsLoaded}},
)

export const getConsensus = createSelector(
  getSamplesState,
  (state: ISamplesState) => state.consensus,
)
export const getConsensusName = createSelector(
  getSamplesState,
  (state: ISamplesState) => state.consensusName,
)
export const getSampleName = createSelector(
  getSamplesState,
  (state: ISamplesState) => state.sampleName,
)
export const getGCAverage = createSelector(
  getSamplesState,
  (state: ISamplesState) => state.gcAvg,
)
export const getCoverageAverage = createSelector(
  getSamplesState,
  (state: ISamplesState) => state.coverageAvg,
)
export const getBinName = createSelector(
  getSamplesState,
  (state: ISamplesState) => {return {covAvg: state.coverageAvg, gcAvg: state.gcAvg,
                                              consensusName: state.consensusName, sampleName: state.sampleName}},
)
export const getTotalLength = createSelector(
  getSamplesState,
  (state: ISamplesState) => state.totalLength,
)

export const getReloadSamples = createSelector(
  getSamplesState,
  (state: ISamplesState) => state.reloadSamples,
)

export const getSelectedCount = createSelector(
  getSamplesState,
  (state: ISamplesState) => state.selectedCount,
)